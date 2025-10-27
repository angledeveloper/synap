import { mockReportData } from "./mockReportData";

export async function fetchReportData(reportId: number) {
  // Mock fetch to mirror future API signature
  // eslint-disable-next-line no-console
  console.log("Mock fetching report:", reportId);
  return Promise.resolve(mockReportData);
}

export async function initiatePayment(licenseId: string, reportId: number) {
  // eslint-disable-next-line no-console
  console.log("Mock payment:", licenseId, reportId);
  return Promise.resolve({
    success: true,
    license_key: `SYN-${reportId}-${licenseId.toUpperCase()}-${Math.floor(
      Math.random() * 9999
    )}`,
  });
}


