// /api/verify-transfer.js
export default async function handler(req, res) {
  const { reference } = req.body;

  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });

  const verifyData = await verifyRes.json();
  const now = Date.now();
  const expiresAt = req.body.expiresAt; // or retrieve from stored session/workflow

  if (now > expiresAt) {
    return res.status(400).json({ status: false, message: "Transfer window expired" });
  }

  if (verifyData.status && verifyData.data.status === "success") {
    res.status(200).json({
      status: "success",
      amount: verifyData.data.amount / 100,
      paidAt: verifyData.data.paid_at,
    });
  } else {
    res.status(400).json({
      status: "failed",
      message: verifyData.message,
    });
  }
}