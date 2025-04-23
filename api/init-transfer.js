export default async function handler(req, res) {
  const { amount, name } = req.body;

  const timestamp = Date.now();
  const email = `user+${timestamp}@example.com`;

  // 1. Create Customer
  const customerRes = await fetch("https://api.paystack.co/customer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      first_name: name,
    }),
  });

  const customerData = await customerRes.json();
  const customerCode = customerData.data.customer_code;

  // 2. Generate Dedicated Account
  const accountRes = await fetch("https://api.paystack.co/dedicated_account", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer: customerCode,
      preferred_bank: "wema-bank", // optional: wema-bank, providus, etc.
    }),
  });

  const accountData = await accountRes.json();

  // Return account info to Botpress
  res.status(200).json({
    status: true,
    bankName: accountData.data.bank.name,
    accountNo: accountData.data.account_number,
    accountName: accountData.data.account_name,
    reference: accountData.data.reference, // save to workflow.transferReference
    customerCode,
    createdAt: timestamp, // Send this to Botpress
    expiresAt: timestamp + 10 * 60 * 1000, // 10 minutes from creation
  });
}