function getNumberFormat(locales, options = undefined) {
  return new Intl.NumberFormat(locales, options).format;
}

function addAdditionalPointForPerformance(audience) {
  return Math.floor(audience / 5);
}

function addPointForPerformance(audience) {
  return Math.max(audience - 30, 0);
}

function calcVolumeCredits(audience, playType) {
  let volumeCredits = 0;
  volumeCredits += addPointForPerformance(audience);

  switch (playType) {
    case "tragedy": // 비극
      break;
    case "comedy": // 희극
      volumeCredits += addAdditionalPointForPerformance(audience);
      break;
    default:
      throw new Error(`알 수 없는 장르: ${playType}`);
  }

  return volumeCredits;
}

function calcPerformanceAmount(audience, playType) {
  let totalAmount = 0;

  switch (playType) {
    case "tragedy": // 비극
      totalAmount = 40000;
      if (audience > 30) {
        totalAmount += 1000 * (audience - 30);
      }

      break;
    case "comedy": // 희극
      totalAmount = 30000;
      if (audience > 20) {
        totalAmount += 10000 + 500 * (audience - 20);
      }
      totalAmount += 300 * audience;
      break;
    default:
      throw new Error(`알 수 없는 장르: ${playType}`);
  }
  return totalAmount;
}

function getBillingHistory(playName, audience, performanceAmount) {
  return `   ${playName}: ${format(performanceAmount / 100)} (${audience}석)\n`;
}

function getResultTxt(invoiceCustomer, totalAmount, volumeCredits, billingHistory) {
  const format = getNumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
  
  return `청구 내역 (고객명: ${invoiceCustomer})\n ${billingHistory}총액: ${format(totalAmount / 100)}\n적립 포인트: ${volumeCredits}점\n`;
}

function statement({ customer: invoiceCustomer, performances: invoicePerformances }, plays) {
  const { totalAmount, volumeCredits, billingHistory } = invoicePerformances.reduce(({totalAmount, volumeCredits, billingHistory}, perf) => {
      const audience = perf.audience;
      const { type, name } = plays[perf.playID];
      const performanceAmount = calcPerformanceAmount(audience, type);

      return {
        totalAmount: totalAmount += performanceAmount;
        volumeCredits: volumeCredits += calcVolumeCredits(audience, type);
        billingHistory: billingHistory += getBillingHistory(name, audience, performanceAmount);
      }
    },{ totalAmount: 0, volumeCredits: 0, billingHistory: "" }
  );

  return getResultTxt(invoiceCustomer, totalAmount, volumeCredits, billingHistory);
}
