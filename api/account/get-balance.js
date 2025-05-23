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
    const response = await axios.get('https://api.paystack.co/transaction', {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      },
      params: {
        perPage: 50 // Adjust as needed
      }
    });

    const allTransactions = response.data.data;

    // Filter by customerCode and status
    const userTransactions = allTransactions.filter(
      tx =>
        tx.customer &&
        tx.customer.customer_code === customerCode &&
        tx.status === 'success'
    );

    const totalReceived = userTransactions.reduce((sum, tx) => sum + tx.amount, 0) / 100;

    return res.status(200).json({
      customerCode,
      totalReceived,
      transactions: userTransactions.length,
      message: userTransactions.length === 0
        ? 'No transactions found for this customer.'
        : 'Balance calculated from successful transactions.'
    });

  } catch (error) {
    console.error("Error fetching transactions:", error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to fetch transactions',
      details: error.response?.data || error.message
    });
  }
}