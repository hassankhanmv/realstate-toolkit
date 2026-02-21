export interface BaseTemplateOptions {
  title: string;
  body: string;
  dir?: "ltr" | "rtl";
}

/**
 * Shared HTML email wrapper.
 * Provides a responsive, RTL-compatible layout with consistent branding.
 */
export function baseTemplate({
  title,
  body,
  dir = "ltr",
}: BaseTemplateOptions): string {
  return `<!DOCTYPE html>
<html lang="${dir === "rtl" ? "ar" : "en"}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #18181b;
      direction: ${dir};
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #c9a96e;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .body {
      padding: 40px;
      line-height: 1.7;
      font-size: 15px;
      color: #3f3f46;
    }
    .body h2 {
      margin: 0 0 16px 0;
      color: #18181b;
      font-size: 20px;
    }
    .body p {
      margin: 0 0 16px 0;
    }
    .btn {
      display: inline-block;
      padding: 12px 32px;
      background: #c9a96e;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      margin: 8px 0;
    }
    .footer {
      padding: 24px 40px;
      text-align: center;
      font-size: 12px;
      color: #a1a1aa;
      border-top: 1px solid #f4f4f5;
    }
    .footer a {
      color: #c9a96e;
      text-decoration: none;
    }
    .detail-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #f4f4f5;
    }
    .detail-label {
      font-weight: 600;
      color: #71717a;
      min-width: 120px;
      font-size: 13px;
    }
    .detail-value {
      color: #18181b;
      font-size: 14px;
    }
    @media (max-width: 640px) {
      .container { margin: 0; border-radius: 0; }
      .header, .body, .footer { padding-left: 24px; padding-right: 24px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RealEstate Toolkit</h1>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} RealEstate Toolkit. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}
