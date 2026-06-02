import { useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calculator, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

// ─── 한국 근로소득세 계산 유틸 ────────────────────────────────────────────────

const EARNED_INCOME_DEDUCTION = (income: number): number => {
  if (income <= 5_000_000)   return income * 0.7;
  if (income <= 15_000_000)  return 3_500_000 + (income - 5_000_000) * 0.4;
  if (income <= 45_000_000)  return 7_500_000 + (income - 15_000_000) * 0.15;
  if (income <= 100_000_000) return 12_000_000 + (income - 45_000_000) * 0.05;
  return 14_750_000 + (income - 100_000_000) * 0.02;
};

const TAX_BRACKETS = [
  { limit: 14_000_000,  rate: 0.06, base: 0 },
  { limit: 50_000_000,  rate: 0.15, base: 840_000 },
  { limit: 88_000_000,  rate: 0.24, base: 6_240_000 },
  { limit: 150_000_000, rate: 0.35, base: 15_360_000 },
  { limit: 300_000_000, rate: 0.38, base: 37_060_000 },
  { limit: 500_000_000, rate: 0.40, base: 94_060_000 },
  { limit: 1_000_000_000, rate: 0.42, base: 174_060_000 },
  { limit: Infinity,    rate: 0.45, base: 384_060_000 },
];

function calcTax(taxBase: number): number {
  if (taxBase <= 0) return 0;
  const bracket = TAX_BRACKETS.find(b => taxBase <= b.limit)!;
  const prevLimit = TAX_BRACKETS[TAX_BRACKETS.indexOf(bracket) - 1]?.limit ?? 0;
  return bracket.base + (taxBase - prevLimit) * bracket.rate;
}

function calcIncomeTax(inputs: Inputs): TaxResult {
  const annualIncome = inputs.monthlySalary * 12;

  // 근로소득공제
  const earnedDeduction = Math.min(EARNED_INCOME_DEDUCTION(annualIncome), 20_000_000);

  // 근로소득금액
  const earnedIncome = annualIncome - earnedDeduction;

  // 소득공제
  const personalDeduction = 1_500_000 * (1 + inputs.dependents); // 본인 + 부양가족
  const pensionDeduction   = Math.min(inputs.nationalPension, earnedIncome * 0.09);
  const totalDeduction     = personalDeduction + pensionDeduction;

  // 과세표준
  const taxBase = Math.max(0, earnedIncome - totalDeduction);

  // 산출세액
  const calculatedTax = calcTax(taxBase);

  // 세액공제
  const irpCredit      = Math.min(inputs.irp + inputs.pensionSaving, 9_000_000) * (annualIncome <= 55_000_000 ? 0.165 : 0.132);
  const earnedCredit   = taxBase <= 33_000_000 ? Math.min(740_000, calculatedTax * 0.55) : 66_000;
  const totalCredit    = irpCredit + earnedCredit;

  // 결정세액
  const finalTax = Math.max(0, calculatedTax - totalCredit);

  // 절세 여지
  const irpRoom    = Math.max(0, 9_000_000 - inputs.irp - inputs.pensionSaving);
  const irpSaving  = irpRoom * (annualIncome <= 55_000_000 ? 0.165 : 0.132);

  return { annualIncome, earnedDeduction, earnedIncome, taxBase, calculatedTax, totalCredit, finalTax, irpRoom, irpSaving };
}

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface Inputs {
  monthlySalary:  number;
  dependents:     number;
  irp:            number;
  pensionSaving:  number;
  nationalPension: number;
}

interface TaxResult {
  annualIncome:    number;
  earnedDeduction: number;
  earnedIncome:    number;
  taxBase:         number;
  calculatedTax:   number;
  totalCredit:     number;
  finalTax:        number;
  irpRoom:         number;
  irpSaving:       number;
}

// ─── 공용 UI ──────────────────────────────────────────────────────────────────

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '16px', ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
      {icon}
      <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{label}</span>
    </div>
  );
}

function InputRow({ label, value, onChange, unit = '원', step = 100000 }: {
  label: string; value: number; onChange: (v: number) => void; unit?: string; step?: number;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="number"
          value={value}
          step={step}
          min={0}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            width: 110, textAlign: 'right', border: '1px solid #cbd5e1', borderRadius: 8,
            padding: '4px 8px', fontSize: 13, color: '#0f172a', outline: 'none',
          }}
        />
        <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 14 }}>{unit}</span>
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 13, color: highlight ? '#0f172a' : '#64748b', fontWeight: highlight ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: highlight ? 700 : 500, color: highlight ? '#2563eb' : '#334155' }}>
        {value.toLocaleString()}원
      </span>
    </div>
  );
}

function TipCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <Lightbulb size={15} color="#0284c7" style={{ marginTop: 1, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', margin: '0 0 3px' }}>{title}</p>
          <p style={{ fontSize: 12, color: '#0c4a6e', margin: 0, lineHeight: 1.6 }}>{body}</p>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function TaxCalculator() {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState<Inputs>({
    monthlySalary:   4_800_000,
    dependents:      0,
    irp:             0,
    pensionSaving:   0,
    nationalPension: 216_000,
  });

  const [showDetail, setShowDetail] = useState(false);

  const set = (key: keyof Inputs) => (v: number) => setInputs(prev => ({ ...prev, [key]: v }));

  const result = calcIncomeTax(inputs);

  const tips: { title: string; body: string }[] = [];

  if (result.irpRoom > 0) {
    tips.push({
      title: `IRP / 연금저축 추가 납입 시 최대 ${Math.round(result.irpSaving / 10000).toLocaleString()}만원 절세`,
      body: `현재 세액공제 한도 9,000,000원 중 ${result.irpRoom.toLocaleString()}원이 남아있어요. IRP 또는 연금저축에 추가 납입하면 세금을 더 줄일 수 있어요.`,
    });
  }
  if (inputs.dependents === 0) {
    tips.push({
      title: '부양가족 공제를 확인해보세요',
      body: '소득이 없는 부모님·배우자·자녀를 부양가족으로 등록하면 1인당 150만원 추가 공제를 받을 수 있어요.',
    });
  }
  if (result.annualIncome > 70_000_000) {
    tips.push({
      title: '고소득 구간 — ISA 계좌 활용 추천',
      body: '연소득 7,000만원 초과 시 ISA 만기 수령 시 비과세 혜택(200만원)을 받을 수 있어요. 절세형 투자 수단으로 적극 활용해보세요.',
    });
  }
  if (tips.length === 0) {
    tips.push({
      title: '현재 공제 항목을 잘 활용하고 있어요',
      body: '추가로 의료비·교육비 세액공제 영수증을 챙겨두면 연말정산 시 환급을 더 받을 수 있어요.',
    });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 390, margin: '0 auto', minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

        {/* 헤더 */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#fff', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ChevronLeft size={24} color="#0f172a" />
          </button>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>세금 계산기</h1>
          <div style={{ width: 32 }} />
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* 안내 배너 */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 14px' }}>
            <p style={{ fontSize: 12, color: '#1e40af', margin: 0, lineHeight: 1.6 }}>
              📌 근로소득세 기준 추정값이에요. 실제 연말정산 결과와 다를 수 있어요.
            </p>
          </div>

          {/* 입력 섹션 */}
          <Card>
            <SectionTitle icon={<Calculator size={15} color="#6366f1" />} label="소득 정보" />
            <InputRow label="월 급여 (세전)"     value={inputs.monthlySalary}   onChange={set('monthlySalary')}   step={100_000} />
            <InputRow label="국민연금 월 납입액"  value={inputs.nationalPension} onChange={set('nationalPension')} step={10_000} />
            <InputRow label="부양가족 수 (본인 제외)" value={inputs.dependents} onChange={set('dependents')} unit="명" step={1} />
          </Card>

          <Card>
            <SectionTitle icon={<Calculator size={15} color="#10b981" />} label="절세 항목" />
            <InputRow label="IRP 연간 납입액"      value={inputs.irp}           onChange={set('irp')}           step={100_000} />
            <InputRow label="연금저축 연간 납입액" value={inputs.pensionSaving} onChange={set('pensionSaving')} step={100_000} />
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>IRP + 연금저축 합산 세액공제 한도 9,000,000원</p>
          </Card>

          {/* 결과 요약 */}
          <Card style={{ border: '1.5px solid #6366f1' }}>
            <SectionTitle icon={<Calculator size={15} color="#6366f1" />} label="세금 추정 결과" />

            <ResultRow label="연간 근로소득"  value={result.annualIncome} />
            <ResultRow label="근로소득공제"   value={result.earnedDeduction} />
            <ResultRow label="각종 소득공제"  value={result.earnedIncome - result.taxBase} />

            <button
              onClick={() => setShowDetail(v => !v)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px 0', color: '#6366f1', fontSize: 12 }}
            >
              {showDetail ? <><ChevronUp size={13} /> 상세 접기</> : <><ChevronDown size={13} /> 상세 보기</>}
            </button>

            {showDetail && (
              <>
                <ResultRow label="과세표준"    value={result.taxBase} />
                <ResultRow label="산출세액"    value={result.calculatedTax} />
                <ResultRow label="세액공제 합계" value={result.totalCredit} />
              </>
            )}

            <div style={{ marginTop: 12, padding: '14px', background: '#eff6ff', borderRadius: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#6366f1', margin: '0 0 4px' }}>예상 결정세액 (연간)</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#2563eb', margin: 0 }}>
                {result.finalTax.toLocaleString()}원
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
                월 평균 약 {Math.round(result.finalTax / 12).toLocaleString()}원
              </p>
            </div>
          </Card>

          {/* 절세 팁 */}
          <Card>
            <SectionTitle icon={<Lightbulb size={15} color="#f59e0b" />} label="절세 추천" />
            {tips.map((t, i) => <TipCard key={i} title={t.title} body={t.body} />)}
          </Card>

          {/* 스텁 안내 */}
          <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 12, padding: '12px 14px' }}>
            <p style={{ fontSize: 12, color: '#854d0e', margin: 0, lineHeight: 1.6 }}>
              🚧 <strong>스텁 화면</strong>입니다. 향후 실제 급여·IRP 데이터와 자동 연동 예정이에요.
            </p>
          </div>

          <div style={{ height: 24 }} />
        </div>
      </div>
    </div>
  );
}
