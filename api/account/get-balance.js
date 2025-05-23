import axios from 'axios';

export default async function handler(req, res) {
  const { customerCode } = req.query;

  if (!customerCode) {
    return res.status(400).json({ error: "Missing customerCode" });
  }

  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

  try {
    const url = `https://api.paystack.co/customer/${customerCode}/transactions`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const transactions = response.data.data || [];

    // Filter for successful bank transfers only
    const successfulBankTransactions = transactions.filter(txn =>
      txn.status === 'success' && txn.channel === 'bank'
    );

    // Sum the amounts (Paystack returns kobo, so divide by 100)
    const totalReceived = successfulBankTransactions.reduce((sum, txn) => {
      return sum + txn.amount / 100;
    }, 0);

    return res.status(200).json({
      customerCode,
      totalReceived,
      transactionCount: successfulBankTransactions.length
    });

  } catch (error) {
    console.error("Paystack API Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
}
