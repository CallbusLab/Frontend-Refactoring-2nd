function getBillStatement(invoice, plays) {
  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;

  for (let perfomance of invoice.performances) {
    const play = plays[perfomance.playID];

    const thisAmount = getPlayAmount(play.type, perfomance.audience);
    totalAmount += thisAmount;

    volumeCredits += getPlayCredit(play.type, perfomance.audience);

    result +=`   ${play.name}: ${USDNumberFormat(thisAmount)} (${perfomance.audience}석)\n`;
  }

  result += `총액: ${USDNumberFormat(totalAmount)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;
  return result;
}

function USDNumberFormat(totalAmount) {
  return new Intl.NumberFormat("en-US",
      { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(totalAmount/100);
}

function getPlayAmount(playType, audience) {
  if (PlayInfo[playType]) {
    const {defaultAmount, minAudience, getMinAudienceAmount, getAudienceAmount} = PlayInfo[playType];

    let playAmount = defaultAmount;

    if (audience > minAudience) {
      playAmount += getMinAudienceAmount(audience);
    }
    playAmount += getAudienceAmount(audience);

    return playAmount;
  } else {
    throw new Error(`알 수 없는 장르: ${playType}`);
  }
}

function getPlayCredit(playType, audience) {
  let playCredit = 0;

  playCredit += Math.max(audience - 30, 0);

  if (playType === "comedy")
    playCredit += Math.floor(audience / 5);

  return playCredit;
}

const PlayInfo = {
  "tragedy": {
    defaultAmount: 40000,
    minAudience: 30,
    getMinAudienceAmount: (audience) => 1000 * (audience - 30),
    getAudienceAmount: () => 0
  },
  "comedy": {
    defaultAmount: 30000,
    minAudience: 20,
    getMinAudienceAmount: (audience) => 10000 + 500 * (audience - 20),
    getAudienceAmount: (audience) => 300 * audience
  }
}