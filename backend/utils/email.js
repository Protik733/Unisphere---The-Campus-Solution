const { sendMailViaGmail } = require("./gmailClient");

const sendEmail = async (email, orderId, paymentId, amount, userId, userName, items) => {
    try {
        await sendMailViaGmail({
            to: email,
            subject: "Unisphere - Payment Receipt",
            html: `
                <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 30px; color: #333333; background-color: #ffffff;">
                    
                    <h2 style="text-align: center; color: #111827; margin-bottom: 5px; font-size: 24px;">Unisphere Campus Solution</h2>
                    <h3 style="text-align: center; color: #374151; margin-top: 5px; font-size: 18px;">Payment Receipt</h3>

                    <div style="border-top: 2px solid #2563eb; margin: 20px 0;"></div>

                    <p style="margin: 8px 0; font-size: 15px;"><b>Receipt No:</b> REC-${Date.now().toString().slice(-6)}</p>
                    <p style="margin: 8px 0; font-size: 15px;"><b>Order ID:</b> ${orderId}</p>
                    <p style="margin: 8px 0; font-size: 15px;"><b>Payment ID:</b> ${paymentId}</p>

                    <div style="border-top: 1px solid #e0e0e0; margin: 20px 0;"></div>

                    <p style="margin: 8px 0; font-size: 15px;"><b>Student ID:</b> ${userId}</p>
                    <p style="margin: 8px 0; font-size: 15px;"><b>Student Name:</b> ${userName}</p>
                    <p style="margin: 8px 0; font-size: 15px;"><b>Email:</b> <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></p>

                    <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 15px;">
                        <thead>
                            <tr style="background-color: #f9fafb;">
                                <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left; color: #111827;">Items</th>
                                <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: center; color: #111827;">Qty</th>
                                <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; color: #111827;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td style="border: 1px solid #e5e7eb; padding: 12px; color: #374151;">${item.name}</td>
                                    <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: center; color: #374151;">${item.qty}</td>
                                    <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; color: #374151;">₹${item.price * item.qty}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>

                    <h3 style="text-align: right; color: #16a34a; font-size: 20px; margin-top: 10px;">Total Amount: ₹${amount}</h3>

                    <div style="text-align: center; margin-top: 40px; font-size: 14px; color: #6b7280;">
                        <p style="margin: 5px 0;"><b>Payment Status:</b> <span style="color: #6b7280;">Paid</span></p>
                        <p style="margin: 5px 0;"><b>Date:</b> ${new Date().toLocaleDateString()} | <b>Time:</b> ${new Date().toLocaleTimeString()}</p>
                    </div>

                </div>
            `
        });

        console.log("Email receipt sent successfully!");

    } catch (error) {
        console.error("Gmail API Error:", error);
    }
};

module.exports = sendEmail;