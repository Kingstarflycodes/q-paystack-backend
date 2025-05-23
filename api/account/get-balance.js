import axios from 'axios';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { customerCode } = req.body;

  if (!customerCode) {
    return res.status(400).json({ error: "Missing customerCode in body" });
  }

  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

  try {
    const response = await axios.get(`https://api.paystack.co/customer/${customerCode}/transactions`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const transactions = response.data.data || [];

    const successfulBankTransactions = transactions.filter(txn =>
      txn.status === 'success' && txn.channel === 'bank'
    );

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
