import kakaoImg    from '../assets/banks/kakao.png';
import tossImg      from '../assets/banks/toss.png';
import shinhanImg   from '../assets/banks/shinhan.png';
import hanaImg      from '../assets/banks/hana.png';
import wooriImg     from '../assets/banks/woori.png';
import kbImg        from '../assets/banks/kb.png';
import miraeImg     from '../assets/banks/mirae.png';
import samsungImg   from '../assets/banks/samsung.png';
import nhImg        from '../assets/banks/NH.png';
import bcImg        from '../assets/banks/bc.png';
import ibkImg       from '../assets/banks/ibk.svg';
import meritzImg    from '../assets/banks/meritz.png';
import kiwoomImg    from '../assets/banks/키움.jpg';
import koreainvImg  from '../assets/banks/한국투자증권.jpg';
import lotteImg     from '../assets/banks/롯데.png';
import hyundaiImg   from '../assets/banks/현대.svg';

export interface BankMeta {
  logo: string;
  imgSrc: string;
  bg: string;
  color: string;
  badgeBg: string;
  badgeColor: string;
  isWoori: boolean;
}

const BANKS: Record<string, BankMeta> = {
  // ── 은행 ──────────────────────────────────────────────────
  '카카오뱅크':      { logo: 'K',  imgSrc: kakaoImg,   bg: '#FEE500', color: '#3C1E1E', badgeBg: '#FEF3C7', badgeColor: '#854D0E', isWoori: false },
  '토스뱅크':        { logo: 'T',  imgSrc: tossImg,    bg: '#3182F6', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1D4ED8', isWoori: false },
  '신한은행':        { logo: 'S',  imgSrc: shinhanImg, bg: '#0046FF', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1E40AF', isWoori: false },
  '하나은행':        { logo: 'H',  imgSrc: hanaImg,    bg: '#009F6B', color: '#fff',    badgeBg: '#D1FAE5', badgeColor: '#065F46', isWoori: false },
  '우리은행':        { logo: 'W',  imgSrc: wooriImg,   bg: '#0067AC', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1E40AF', isWoori: true  },
  '국민은행':        { logo: 'K',  imgSrc: kbImg,      bg: '#FFBC00', color: '#3C1E1E', badgeBg: '#FEF3C7', badgeColor: '#92400E', isWoori: false },
  'KB국민은행':      { logo: 'K',  imgSrc: kbImg,      bg: '#FFBC00', color: '#3C1E1E', badgeBg: '#FEF3C7', badgeColor: '#92400E', isWoori: false },
  'IBK기업은행':     { logo: 'I',  imgSrc: ibkImg,     bg: '#00629B', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1E40AF', isWoori: false },

  // ── 증권 ──────────────────────────────────────────────────
  '미래에셋증권':    { logo: '미', imgSrc: miraeImg,   bg: '#F05928', color: '#fff',    badgeBg: '#FFEDD5', badgeColor: '#9A3412', isWoori: false },
  '미래에셋':        { logo: '미', imgSrc: miraeImg,   bg: '#F05928', color: '#fff',    badgeBg: '#FFEDD5', badgeColor: '#9A3412', isWoori: false },
  '한국투자증권':    { logo: '한', imgSrc: koreainvImg, bg: '#FF6600', color: '#fff',   badgeBg: '#FFEDD5', badgeColor: '#9A3412', isWoori: false },
  'NH투자증권':      { logo: 'N',  imgSrc: nhImg,      bg: '#008037', color: '#fff',    badgeBg: '#D1FAE5', badgeColor: '#065F46', isWoori: false },
  '삼성증권':        { logo: 'S',  imgSrc: samsungImg, bg: '#034EA2', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1E40AF', isWoori: false },
  'KB증권':          { logo: 'K',  imgSrc: kbImg,      bg: '#FFBC00', color: '#3C1E1E', badgeBg: '#FEF3C7', badgeColor: '#92400E', isWoori: false },
  '신한투자증권':    { logo: 'S',  imgSrc: shinhanImg, bg: '#0046FF', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1E40AF', isWoori: false },
  '메리츠증권':      { logo: '메', imgSrc: meritzImg,  bg: '#E04B00', color: '#fff',    badgeBg: '#FFEDD5', badgeColor: '#9A3412', isWoori: false },
  '하나증권':        { logo: 'H',  imgSrc: hanaImg,    bg: '#009F6B', color: '#fff',    badgeBg: '#D1FAE5', badgeColor: '#065F46', isWoori: false },
  '키움증권':        { logo: '키', imgSrc: kiwoomImg,  bg: '#C8001E', color: '#fff',    badgeBg: '#FEE2E2', badgeColor: '#991B1B', isWoori: false },
  '우리투자증권':    { logo: 'W',  imgSrc: wooriImg,   bg: '#0067AC', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1E40AF', isWoori: false },
  '토스증권':        { logo: 'T',  imgSrc: tossImg,    bg: '#3182F6', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1D4ED8', isWoori: false },
  '카카오페이증권':  { logo: 'K',  imgSrc: kakaoImg,   bg: '#FEE500', color: '#3C1E1E', badgeBg: '#FEF3C7', badgeColor: '#854D0E', isWoori: false },

  // ── 카드 ──────────────────────────────────────────────────
  '신한카드':        { logo: 'S',  imgSrc: shinhanImg, bg: '#0046FF', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1E40AF', isWoori: false },
  '삼성카드':        { logo: 'S',  imgSrc: samsungImg, bg: '#034EA2', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1E40AF', isWoori: false },
  '현대카드':        { logo: '현', imgSrc: hyundaiImg, bg: '#1A1A1A', color: '#fff',    badgeBg: '#F1F5F9', badgeColor: '#475569', isWoori: false },
  'KB국민카드':      { logo: 'K',  imgSrc: kbImg,      bg: '#FFBC00', color: '#3C1E1E', badgeBg: '#FEF3C7', badgeColor: '#92400E', isWoori: false },
  '롯데카드':        { logo: '롯', imgSrc: lotteImg,   bg: '#E60012', color: '#fff',    badgeBg: '#FEE2E2', badgeColor: '#991B1B', isWoori: false },
  '우리카드':        { logo: 'W',  imgSrc: wooriImg,   bg: '#0067AC', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1E40AF', isWoori: false },
  '하나카드':        { logo: 'H',  imgSrc: hanaImg,    bg: '#009F6B', color: '#fff',    badgeBg: '#D1FAE5', badgeColor: '#065F46', isWoori: false },
  'BC카드':          { logo: 'B',  imgSrc: bcImg,      bg: '#005BAC', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1E40AF', isWoori: false },
  'NH농협카드':      { logo: 'N',  imgSrc: nhImg,      bg: '#008037', color: '#fff',    badgeBg: '#D1FAE5', badgeColor: '#065F46', isWoori: false },
  'IBK기업은행 카드': { logo: 'I', imgSrc: ibkImg,     bg: '#00629B', color: '#fff',    badgeBg: '#DBEAFE', badgeColor: '#1E40AF', isWoori: false },
};

const FALLBACK: BankMeta = {
  logo: '?', imgSrc: wooriImg, bg: '#94a3b8', color: '#fff',
  badgeBg: '#F1F5F9', badgeColor: '#475569', isWoori: false,
};

export const getBankMeta = (name: string): BankMeta =>
  BANKS[name] ?? { ...FALLBACK, logo: (name || '?')[0] };

export const getBankImgSrc = (name: string): string | undefined =>
  BANKS[name]?.imgSrc;

export const getBankBadge = (name: string): { bg: string; color: string } =>
  BANKS[name]
    ? { bg: BANKS[name].badgeBg, color: BANKS[name].badgeColor }
    : { bg: FALLBACK.badgeBg, color: FALLBACK.badgeColor };

export const isWooriBank = (name: string): boolean =>
  BANKS[name]?.isWoori ?? false;
