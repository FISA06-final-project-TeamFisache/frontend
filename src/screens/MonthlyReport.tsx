import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getReport, generateReport, type ReportDetail, type AssetSnapshot, type WeeklyExpense, type CategoryExpenseItem } from '../api/reportApi';

const TODAY = new Date();

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function fmtMan(n: number) {
  return `${Math.round(Math.abs(n) / 10000).toLocaleString()}만 원`;
}
function pctToXY(cx: number, cy: number, r: number, pct: number) {
  const rad = (pct / 100) * 2 * Math.PI - Math.PI / 2;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ─── 공용 UI ──────────────────────────────────────────────────────────────────

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 14, padding: 14, ...style }}>
      {children}
    </div>
  );
}

function BlockHeader({ children, color }: { children: ReactNode; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 6px' }}>
      <div style={{ width: 4, height: 22, background: color, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>{children}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', margin: '0 0 7px 2px' }}>{children}</p>;
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px' }}>
      <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 700, color, margin: 0 }}>{value}</p>
    </div>
  );
}

function ChangeBadge({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
      background: pos ? '#E1F5EE' : '#FCEBEB',
      color: pos ? '#0F6E56' : '#A32D2D',
    }}>
      {pos ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
}

// ─── 자산 추이 차트 ────────────────────────────────────────────────────────────

function AssetTrendChart({ data }: { data: { label: string; value: number }[] }) {
  const W = 290, H = 100, PAD = { t: 10, b: 28, l: 36, r: 12 };
  if (data.length < 2) return <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>데이터 없음</p>;
  const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b;
  const vals = data.map(d => d.value);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const xOf = (i: number) => PAD.l + (i / (data.length - 1)) * iW;
  const yOf = (v: number) => PAD.t + (1 - (v - minV) / range) * iH;
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(d.value).toFixed(1)}`).join(' ');
  const fill = `${path} L ${xOf(data.length - 1).toFixed(1)} ${(PAD.t + iH).toFixed(1)} L ${PAD.l.toFixed(1)} ${(PAD.t + iH).toFixed(1)} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#378ADD" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#378ADD" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#trendGrad)" />
      <path d={path} fill="none" stroke="#378ADD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.label}</text>
      ))}
      {data.map((d, i) => (
        <circle key={i} cx={xOf(i)} cy={yOf(d.value)} r="3" fill="#378ADD" />
      ))}
    </svg>
  );
}

// ─── 누적 지출 비교 차트 ───────────────────────────────────────────────────────

function CumulativeChart({ data }: { data: { label: string; thisMonth: number; lastMonth: number }[] }) {
  const W = 290, H = 100, PAD = { t: 10, b: 28, l: 28, r: 12 };
  if (data.length < 2) return <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>데이터 없음</p>;
  const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b;
  const maxV = Math.max(...data.flatMap(d => [d.thisMonth, d.lastMonth])) * 1.25;
  const xOf = (i: number) => PAD.l + (i / (data.length - 1)) * iW;
  const yOf = (v: number) => PAD.t + (1 - v / maxV) * iH;
  const toPath = (key: 'thisMonth' | 'lastMonth') =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(d[key]).toFixed(1)}`).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible', display: 'block' }}>
      {[0.5, 1].map((r, i) => {
        const yv = PAD.t + (1 - r) * iH;
        return <line key={i} x1={PAD.l} y1={yv} x2={W - PAD.r} y2={yv} stroke="#f1f5f9" strokeWidth="1" />;
      })}
      <path d={toPath('lastMonth')} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
      <path d={toPath('thisMonth')} fill="none" stroke="#EF9F27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.label}</text>
      ))}
    </svg>
  );
}

// ─── 지출 도넛 차트 ────────────────────────────────────────────────────────────

const EXPENSE_COLORS = ['#D85A30', '#EF9F27', '#7F77DD', '#378ADD', '#1D9E75', '#94a3b8'];

function SpendingDonut({ categories }: { categories: CategoryExpenseItem[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const total = categories.reduce((s, c) => s + c.amount, 0);
  const cx = 64, cy = 64, outerR = 56, innerR = 36;
  let cum = 0;
  const slices = categories.map((c, i) => {
    const pct = (c.amount / total) * 100;
    const start = cum; cum += pct;
    const o1 = pctToXY(cx, cy, outerR, start), o2 = pctToXY(cx, cy, outerR, cum);
    const i2 = pctToXY(cx, cy, innerR, cum), i1 = pctToXY(cx, cy, innerR, start);
    const large = pct > 50 ? 1 : 0;
    return {
      path: `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y} L ${i2.x} ${i2.y} A ${innerR} ${innerR} 0 ${large} 0 ${i1.x} ${i1.y} Z`,
      pct, color: EXPENSE_COLORS[i % EXPENSE_COLORS.length], label: c.category,
    };
  });
  const active = activeIdx !== null ? slices[activeIdx] : null;
  const hint = activeIdx !== null ? categories[activeIdx].hoverComment : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 128, height: 128, flexShrink: 0 }}>
          <svg width="128" height="128" viewBox="0 0 128 128">
            {slices.map((s, i) => (
              <path key={i} d={s.path} fill={s.color}
                opacity={activeIdx === null || activeIdx === i ? 1 : 0.25}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                style={{ cursor: 'default', transition: 'opacity 0.15s' }}
              />
            ))}
            <circle cx={cx} cy={cy} r={innerR} fill="white" onClick={() => setActiveIdx(null)} style={{ cursor: 'pointer' }} />
            {active ? (
              <>
                <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">{active.label}</text>
                <text x={cx} y={cy + 7} textAnchor="middle" fontSize="11" fontWeight="800" fill={active.color}>{active.pct.toFixed(0)}%</text>
              </>
            ) : (
              <>
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize="8" fill="#94a3b8">총 지출</text>
                <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a">{fmtMan(total)}</text>
              </>
            )}
          </svg>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#0f172a', flex: 1, opacity: activeIdx !== null && activeIdx !== i ? 0.4 : 1 }}>{s.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{s.pct.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
      {hint && (
        <div style={{ marginTop: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 11, color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {hint}
        </div>
      )}
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {categories.map((c, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: EXPENSE_COLORS[i % EXPENSE_COLORS.length], display: 'inline-block' }} />
              {c.category}
              {c.prevAmount != null && (
                <span style={{ fontSize: 10, color: c.amount > c.prevAmount ? '#A32D2D' : '#0F6E56' }}>
                  {c.amount > c.prevAmount ? '▲' : c.amount < c.prevAmount ? '▼' : ''}
                </span>
              )}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{fmtMan(c.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 메인 ─────────────────────────────────────────────────────────────────────

export default function MonthlyReport() {
  const navigate  = useNavigate();
  const [year,  setYear]  = useState(TODAY.getFullYear());
  const [month, setMonth] = useState(TODAY.getMonth() + 1);
  const [report, setReport]       = useState<ReportDetail | null>(null);
  const [loading, setLoading]     = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const userGoal = sessionStorage.getItem('user:goal') ?? '';

  useEffect(() => {
    let cancelled = false;
    setReport(null);
    setError(null);
    setLoading(true);
    getReport(year, month)
      .then(r => { if (!cancelled) setReport(r); })
      .catch(() => { if (!cancelled) setReport(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [year, month]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const r = await generateReport(year, month);
      setReport(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : '리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  // assetSnapshots → 차트 데이터
  const trendData: { label: string; value: number }[] = (report?.assetSnapshots ?? []).map((s: AssetSnapshot) => ({
    label: s.snapshotDate.slice(5), // MM-DD
    value: s.totalAmount,
  }));

  // weeklyExpenses → 누적 지출 차트 데이터
  const weeklyData: { label: string; thisMonth: number; lastMonth: number }[] = (report?.weeklyExpenses ?? []).map((w: WeeklyExpense) => ({
    label: `${w.week}주`,
    thisMonth: w.currCumulative,
    lastMonth: w.prevCumulative,
  }));

  // 자산 변화 계산
  const snaps = report?.assetSnapshots ?? [];
  const assetChange = snaps.length >= 2
    ? snaps[snaps.length - 1].totalAmount - snaps[0].totalAmount
    : null;
  const assetChangePct = snaps.length >= 2 && snaps[0].totalAmount > 0
    ? ((snaps[snaps.length - 1].totalAmount - snaps[0].totalAmount) / snaps[0].totalAmount) * 100
    : null;

  // 누적 지출 마지막 주 값
  const lastWeek = weeklyData.length > 0 ? weeklyData[weeklyData.length - 1] : null;
  const weeklyDiff = lastWeek ? lastWeek.lastMonth - lastWeek.thisMonth : null;

  const outperform = report?.performanceStatus === 'OUTPERFORM';
  const isCurrentMonth = year === TODAY.getFullYear() && month === TODAY.getMonth() + 1;
  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (isCurrentMonth) return; if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', justifyContent: 'center', fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 375, minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 12px', background: '#fff', borderBottom: '0.5px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={22} color="#0f172a" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={17} color="#64748b" />
            </button>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', minWidth: 86, textAlign: 'center' }}>
              {year}년 {month}월
            </span>
            <button onClick={nextMonth} disabled={isCurrentMonth}
              style={{ background: 'none', border: 'none', padding: 6, cursor: isCurrentMonth ? 'not-allowed' : 'pointer', opacity: isCurrentMonth ? 0.3 : 1, display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={17} color="#64748b" />
            </button>
          </div>
          <div style={{ width: 34 }} />
        </div>

        {/* 본문 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 52px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#0f172a', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!loading && !report && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '60px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>{year}년 {month}월 리포트가 없어요</p>
              {error && <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>{error}</p>}
              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{ padding: '12px 28px', background: generating ? '#cbd5e1' : '#0f172a', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer' }}
              >
                {generating ? 'AI 리포트 생성 중...' : 'Pori에게 리포트 받기'}
              </button>
            </div>
          )}

          {!loading && report && <>

          {/* ──── 자산 블록 ──── */}
          <BlockHeader color="#378ADD">자산</BlockHeader>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <StatBox label="총 수입" value={fmtMan(report.totalIncome)}  color="#0F6E56" />
            <StatBox label="총 지출" value={fmtMan(report.totalExpense)} color="#A32D2D" />
          </div>

          {/* 자산 추이 */}
          {trendData.length > 0 && (
            <Card>
              <SectionTitle>한달간 변화 추이</SectionTitle>
              <AssetTrendChart data={trendData} />
              {assetChange != null && (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 10 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>전월 대비</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {assetChange >= 0 ? '+' : ''}{fmtMan(assetChange)}
                    </span>
                    {assetChangePct != null && <ChangeBadge value={assetChangePct} />}
                  </div>
                </div>
              )}
              {userGoal && (
                <div style={{ marginTop: 8, padding: '10px 12px', background: '#EEEDFE', borderRadius: 10, fontSize: 12, color: '#534AB7', lineHeight: 1.7 }}>
                  🎯 <strong>{userGoal}</strong> 목표 기준으로 현재 포트폴리오는 목표 달성 경로에 있어요.
                </div>
              )}
            </Card>
          )}

          {/* 시장 상황 */}
          {report.marketCondition && (
            <Card>
              <SectionTitle>시장 상황 요약</SectionTitle>
              <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.8, margin: 0 }}>{report.marketCondition}</p>
            </Card>
          )}

          {/* ──── 소비 블록 ──── */}
          <BlockHeader color="#EF9F27">소비</BlockHeader>

          {/* 누적 지출 비교 */}
          {weeklyData.length > 0 && (
            <Card>
              <SectionTitle>이번달 vs 저번달 누적 지출</SectionTitle>
              <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 20, height: 2.5, background: '#EF9F27', borderRadius: 99 }} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>이번달</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" /></svg>
                  <span style={{ fontSize: 11, color: '#64748b' }}>저번달</span>
                </div>
              </div>
              <CumulativeChart data={weeklyData} />
              {lastWeek && (
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 2px' }}>이번달</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#EF9F27', margin: 0 }}>{fmtMan(lastWeek.thisMonth)}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 2px' }}>저번달</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', margin: 0 }}>{fmtMan(lastWeek.lastMonth)}</p>
                  </div>
                  {weeklyDiff != null && (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 2px' }}>전감</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: weeklyDiff >= 0 ? '#0F6E56' : '#A32D2D', margin: 0 }}>
                        {weeklyDiff >= 0 ? '-' : '+'}{fmtMan(Math.abs(weeklyDiff))}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* 지출 파이차트 */}
          {(report.categoryExpenses ?? []).length > 0 && (
            <Card>
              <SectionTitle>카테고리별 비중</SectionTitle>
              <SpendingDonut categories={report.categoryExpenses} />
            </Card>
          )}

          {/* AI 가이드라인 */}
          {report.guideline && (
            <div style={{ background: '#0f172a', borderRadius: 14, padding: '16px 18px' }}>
              <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 8px' }}>Pori의 다음달 가이드</p>
              <p style={{ fontSize: 13, color: '#f1f5f9', lineHeight: 1.9, margin: 0 }}>{report.guideline}</p>
            </div>
          )}

          {/* 성과 */}
          {(report.performanceComment || report.performanceStatus) && (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: outperform ? '#E1F5EE' : '#FCEBEB', color: outperform ? '#0F6E56' : '#A32D2D', flexShrink: 0 }}>
                  {outperform ? '아웃퍼폼' : '언더퍼폼'}
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>vs 시장 기준</span>
              </div>
              {report.performanceComment && (
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 10, fontSize: 12, color: '#475569', lineHeight: 1.8 }}>
                  {report.performanceComment}
                </div>
              )}
            </Card>
          )}

          {/* 트렌드 코멘트 */}
          {report.trendComment && (
            <Card>
              <SectionTitle>포트폴리오 추이</SectionTitle>
              <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.8, margin: 0 }}>{report.trendComment}</p>
            </Card>
          )}

          </> /* 리포트 있음 끝 */ }

        </div>
      </div>
    </div>
  );
}
