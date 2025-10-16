import { BusinessCardDisplay } from "@/types/business-card";

/**
 * Generate printable HTML for business card
 */
export const generatePrintableCard = (card: BusinessCardDisplay): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${card.title} - Business Card</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body {
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .card-header {
          border-bottom: 3px solid #0066cc;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .card-title {
          font-size: 28px;
          font-weight: bold;
          color: #0066cc;
          margin: 0 0 10px 0;
        }
        
        .card-company {
          font-size: 20px;
          color: #666;
          margin: 0 0 10px 0;
        }
        
        .card-category {
          display: inline-block;
          background: #e3f2fd;
          color: #0066cc;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
        }
        
        .section {
          margin: 25px 0;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #0066cc;
          margin-bottom: 10px;
          border-left: 4px solid #0066cc;
          padding-left: 10px;
        }
        
        .contact-info {
          display: grid;
          gap: 10px;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .contact-label {
          font-weight: 600;
          min-width: 100px;
        }
        
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .tag {
          background: #f5f5f5;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 13px;
          color: #555;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="card-header">
        <h1 class="card-title">${card.title}</h1>
        <p class="card-company">${card.company || ''}</p>
        <span class="card-category">${typeof card.subdomain_key === 'string' ? card.subdomain_key.replace(/_/g, ' ') : ''}</span>
      </div>
      
      ${card.description ? `
      <div class="section">
        <h2 class="section-title">About</h2>
        <p>${card.description}</p>
      </div>
      ` : ''}
      
      <div class="section">
        <h2 class="section-title">Contact Information</h2>
        <div class="contact-info">
          ${card.email ? `
          <div class="contact-item">
            <span class="contact-label">Email:</span>
            <span>${card.email}</span>
          </div>
          ` : ''}
          
          ${card.mobile_phones && card.mobile_phones.length > 0 ? `
          <div class="contact-item">
            <span class="contact-label">Phone:</span>
            <span>${card.mobile_phones.join(', ')}</span>
          </div>
          ` : ''}
          
          ${card.landline_phones && card.landline_phones.length > 0 ? `
          <div class="contact-item">
            <span class="contact-label">Landline:</span>
            <span>${card.landline_phones.join(', ')}</span>
          </div>
          ` : ''}
          
          ${card.website ? `
          <div class="contact-item">
            <span class="contact-label">Website:</span>
            <span>${card.website}</span>
          </div>
          ` : ''}
          
          ${card.address ? `
          <div class="contact-item">
            <span class="contact-label">Address:</span>
            <span>${card.address}</span>
          </div>
          ` : ''}
        </div>
      </div>
      
      ${card.work_hours ? `
      <div class="section">
        <h2 class="section-title">Working Hours</h2>
        <p>${card.work_hours}</p>
      </div>
      ` : ''}
      
      ${card.languages && card.languages.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Languages</h2>
        <p>${card.languages.join(', ')}</p>
      </div>
      ` : ''}
      
      ${card.tags && card.tags.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Services</h2>
        <div class="tags">
          ${card.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
      ` : ''}
      
      <div class="footer">
        <p>Generated from SpotyCard - Your Digital Card Spotted Anywhere</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Print business card
 */
export const printCard = (card: BusinessCardDisplay): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Unable to open print window. Please allow popups.');
  }

  const htmlContent = generatePrintableCard(card);
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};

/**
 * Export business card as PDF (downloads HTML that can be saved as PDF)
 */
export const exportCardAsPDF = (card: BusinessCardDisplay): void => {
  const htmlContent = generatePrintableCard(card);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${card.title.replace(/[^a-z0-9]/gi, '_')}_business_card.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export business card as VCF (vCard format)
 */
export const exportCardAsVCard = (card: BusinessCardDisplay): void => {
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${card.title}
ORG:${card.company || ''}
TITLE:${typeof card.subdomain_key === 'string' ? card.subdomain_key.replace(/_/g, ' ') : ''}
EMAIL:${card.email || ''}
TEL;TYPE=CELL:${card.mobile_phones?.[0] || ''}
TEL;TYPE=WORK:${card.landline_phones?.[0] || ''}
ADR;TYPE=WORK:;;${card.address || ''};;;;
URL:${card.website || ''}
NOTE:${card.description || ''}
END:VCARD`;

  const blob = new Blob([vcard], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${card.title.replace(/[^a-z0-9]/gi, '_')}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
