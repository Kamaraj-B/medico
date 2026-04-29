exports.appointmentCardTemplate = (title, bodyContent, buttonText = '', buttonLink = '#') =>{
  return `
    <div style="max-width: 600px; margin: 20px auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; padding: 20px; box-shadow: 0px 2px 8px rgba(0,0,0,0.1); background: #fff;">
      <h2 style="color: #333; text-align: center;">${title}</h2>
      <div style="font-size: 14px; color: #555; line-height: 1.6;">
        ${bodyContent}
      </div>
      ${
        buttonText
          ? `<div style="text-align: center; margin-top: 20px;">
              <a href="${buttonLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                ${buttonText}
              </a>
            </div>`
          : ''
      }
    </div>
  `;
}

