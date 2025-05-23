// /api/get-balance.js

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { customerCode } = req.body;

  if (!customerCode) {
    return res.status(400).json({ error: 'Customer code is required' });
  }

  try {
    const response = await axios.get(`https://api.paystack.co/customer/${customerCode}/transactions`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const transactions = response.data.data;

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({
        customerCode,
        totalReceived: 0,
        message: 'No transactions found for this customer.'
      });
    }

    const successfulTransactions = transactions.filter(tx => tx.status === 'success');
    const totalReceived = successfulTransactions.reduce((sum, tx) => sum + tx.amount, 0) / 100;

    return res.status(200).json({
      customerCode,
      totalReceived,
      message: 'Balance calculated from successful transactions.'
    });

  } catch (error) {
    console.error("Paystack API error:", error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to fetch transactions',
      details: error.response?.data || error.message
    });
  }
}