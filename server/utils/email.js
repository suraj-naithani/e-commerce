const getOrderConfirmationEmailTemplate = ({ shippingInfo, total, orderItems }) => {
  const text = `
    Hi,

    Thank you for shopping with us! Your order has been confirmed and is now being processed.

    **Order Details**
    Address: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}, ${shippingInfo.country} - ${shippingInfo.pinCode}
    Total: ₹${total.toLocaleString()}

    **Order Summary**
    ${orderItems.name} x ${orderItems.quantity} = ${
      orderItems.price * orderItems.quantity
    }

    If you have any questions, contact our support team.

    Regards,
    Your XYZ`;

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f3f4f6; padding: 24px;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; color: #111827; line-height: 1.6;">
        <p style="margin: 0 0 12px 0;">Hi,</p>
        <p style="margin: 0 0 16px 0;">Thank you for shopping with us! Your order has been confirmed and is now being processed.</p>

        <p style="margin: 0 0 8px 0; font-weight: 700;">Order Details</p>
        <p style="margin: 0;">Address: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}, ${shippingInfo.country} - ${shippingInfo.pinCode}</p>
        <p style="margin: 0 0 16px 0;">Total: ₹${total.toLocaleString()}</p>

        <p style="margin: 0 0 8px 0; font-weight: 700;">Order Summary</p>
        <p style="margin: 0 0 16px 0;">${orderItems.name} x ${orderItems.quantity} = ${
          orderItems.price * orderItems.quantity
        }</p>

        <p style="margin: 0 0 16px 0;">If you have any questions, contact our support team.</p>
        <p style="margin: 0;">Regards,<br />Your XYZ</p>
      </div>
    </div>
  `;

  return { text, html };
};

const getOrderStatusEmailTemplate = ({
  orderId,
  status,
  shippingInfo,
  total,
  orderItems,
}) => {
  const text = `
        Hi,

        Your order with Order ID: ${orderId} has been ${status}. We're excited to update you on the progress of your purchase!

        **Order Details**
        - Address: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}, ${shippingInfo.country} - ${shippingInfo.pinCode}
        - Total: ₹${total.toLocaleString()}

        **Order Summary**
       ${orderItems.name} x ${orderItems.quantity} = ${
    orderItems.price * orderItems.quantity
  }

        If you have any questions or need assistance, feel free to contact our support team.

        Regards,
        Your XYZ`;

  const statusColor = status === "Delivered" ? "#16a34a" : "#2563eb";
  const html = `
    <div style="margin:0;background:#f3f4f6;padding:24px 12px;font-family:Arial,sans-serif;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="background:${statusColor};padding:16px 24px;color:#ffffff;">
          <h2 style="margin:0;font-size:22px;line-height:1.3;">Your Order has been ${status}</h2>
        </div>
        <div style="padding:24px;color:#111827;line-height:1.7;">
          <p style="margin:0 0 12px 0;">Hi,</p>
          <p style="margin:0 0 16px 0;">Your order with Order ID: <strong>${orderId}</strong> has been <strong>${status}</strong>. We're excited to update you on the progress of your purchase!</p>

          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin-bottom:14px;">
            <p style="margin:0 0 8px 0;font-weight:700;">Order Details</p>
            <p style="margin:0 0 4px 0;"><strong>Address:</strong> ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}, ${shippingInfo.country} - ${shippingInfo.pinCode}</p>
            <p style="margin:0;"><strong>Total:</strong> ₹${total.toLocaleString()}</p>
          </div>

          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
            <p style="margin:0 0 8px 0;font-weight:700;">Order Summary</p>
            <p style="margin:0;">${orderItems.name} x ${orderItems.quantity} = ${
    orderItems.price * orderItems.quantity
  }</p>
          </div>

          <p style="margin:0 0 16px 0;">If you have any questions or need assistance, feel free to contact our support team.</p>
          <p style="margin:0;">Regards,<br />Your XYZ</p>
        </div>
      </div>
    </div>
  `;

  return { text, html };
};

export { getOrderConfirmationEmailTemplate, getOrderStatusEmailTemplate };
