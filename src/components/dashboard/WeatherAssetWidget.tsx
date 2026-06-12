// 자산 날씨 위젯 — 예산 초과율에 따라 날씨 테마가 바뀌는 총자산 카드
import type { DashboardData } from '../../api/dashboardApi';
import React from 'react';
import sunnyImg from '../../assets/weather/sunny.png';
import rainImg from '../../assets/weather/rain.png';
import cloudyImg from '../../assets/weather/cloudy.png';
import tornadoImg from '../../assets/weather/tornado.png';
import waveImg from '../../assets/weather/wave.png';
import wave2Img from '../../assets/weather/wave2.png';
import lifebuoyImg from '../../assets/weather/lifebuoy.png';
import poriTornadoImg from '../../assets/weather/pori_tornado.png';
import sunnyCruiseImg from '../../assets/weather/sunny_cruise.png';
import cloudySailboatImg from '../../assets/weather/cloudy_sailboat.png';
import rainKayakImg from '../../assets/weather/rain_kayak.png';

type WeatherType = 'sunny' | 'cloudy' | 'rain' | 'tornado';

function getWeatherState(dashboard: DashboardData): WeatherType {
  const { totalExpense, lastMonthExpense } = dashboard.consumption;
  if (lastMonthExpense <= 0) return 'sunny';   // 비교할 저번 달 데이터 없음
  const over = (totalExpense - lastMonthExpense) / lastMonthExpense;
  if (over <= 0) return 'sunny';      // 저번 달 이하
  if (over <= 0.10) return 'cloudy';  // 0~10% 초과
  if (over <= 0.20) return 'rain';    // 10~20% 초과
  return 'tornado';                   // 20% 초과
}

const WEATHER_CONFIG: Record<WeatherType, {
  img: string; label: string; desc: string;
  bg: string; textColor: string;
  combinedImg?: string;
  poriImg?: string;
  vehicleImg?: string;
  iconSize?: number;
  poriSize?: number;
  vehicleSize?: number;
  // pori를 vehicle 위에 올릴 때의 오프셋 (vehicle 기준 absolute)
  poriOnVehicle?: { bottom: number; right: number; scale: number };
  bottomOffset?: number;
  iconTop?: number;
  iconRight?: number;
}> = {
  sunny: {
    img: sunnyImg,
    label: '맑음',
    desc: '자산 흐름이 순항 중이에요',
    bg: 'linear-gradient(160deg,#38bdf8,#0369a1)',
    textColor: '#fff',
    combinedImg: sunnyCruiseImg,
    vehicleSize: 150,
    bottomOffset: -24,
  },
  cloudy: {
    img: cloudyImg,
    label: '흐림',
    desc: '지출이 살짝 늘고 있어요',
    bg: 'linear-gradient(160deg,#94a3b8,#475569)',
    textColor: '#fff',
    combinedImg: cloudySailboatImg,
    vehicleSize: 140,
    bottomOffset: -18,
    iconSize: 115,
  },
  rain: {
    img: rainImg,
    label: '비',
    desc: '예산을 초과하고 있어요',
    bg: 'linear-gradient(160deg,#1e40af,#1e3a5f)',
    textColor: '#e0f2fe',
    combinedImg: rainKayakImg,
    vehicleSize: 140,
    bottomOffset: -16,
  },
  tornado: {
    img: tornadoImg,
    label: '폭풍',
    desc: '지출 관리가 시급해요!',
    bg: 'linear-gradient(165deg, #a81c1c, #2e1065)',
    textColor: '#fecaca',
    poriImg: poriTornadoImg,
    vehicleImg: lifebuoyImg,
    poriSize: 115,
    vehicleSize: 80,
    // 구명환 오른쪽에 pori 배치 (안 겹치도록)
    poriOnVehicle: { bottom: 2, right: -108, scale: 1.0 },
    bottomOffset: 12,
  },
};

export default function WeatherAssetWidget({ dashboard }: { dashboard: DashboardData }) {
  const weather = getWeatherState(dashboard);
  const cfg = WEATHER_CONFIG[weather];
  const total = dashboard.assetsSummary.totalBalance;
  const fmtM = (n: number) => `${Math.round(n / 10000).toLocaleString()}만`;

  // 이번 주 요일별 실제 지출 (백엔드 weeklyExpenses: [월,화,수,목,금,토,일])
  const weekly = dashboard.consumption.weeklyExpenses ?? [];
  const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = (new Date().getDay() + 6) % 7;   // JS 일=0…토=6 → 월=0…일=6 로 변환
  const weekdays = WEEKDAY_LABELS.map((label, i) => ({ label, amt: weekly[i] ?? 0, isToday: i === todayIdx }));

  // Unified transparent backgrounds using overall box bg
  const sharedOverlayBg = 'transparent';
  const iconSize = cfg.iconSize ?? 100;
  const poriSize = cfg.poriSize ?? 76;
  const vehicleSize = cfg.vehicleSize ?? 72;

  return (
    <div style={{
      borderRadius: 22, 
      overflow: 'hidden',
      background: cfg.bg,
      padding: '18px 20px 0', 
      color: cfg.textColor,
      position: 'relative',
      minHeight: 310, // increased from 290 to fit larger waves
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
    }}>
      {/* CSS Animations */}
      <style>{`
        @keyframes float-pori {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1.5deg); }
        }
        @keyframes float-vehicle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-1.5deg); }
        }
        @keyframes wave-sway {
          0%, 100% { transform: scaleX(1.2) scaleY(1.1) translateX(-10px); }
          50% { transform: scaleX(1.2) scaleY(1.1) translateX(10px); }
        }
        @keyframes rain-fall {
          0% { transform: translateY(0) translateX(0) rotate(12deg); }
          100% { transform: translateY(320px) translateX(-50px) rotate(12deg); }
        }
        @keyframes tornado-rain-fall {
          0% { transform: translateY(0) translateX(0) rotate(24deg); }
          100% { transform: translateY(320px) translateX(-140px) rotate(24deg); }
        }
        .animate-pori {
          animation: float-pori 3s ease-in-out infinite;
        }
        .animate-vehicle {
          animation: float-vehicle 3.5s ease-in-out infinite;
        }
        .animate-wave {
          animation: wave-sway 5s ease-in-out infinite;
          transform-origin: bottom center;
        }
        @keyframes sun-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
      `}</style>

      {/* Sunlight Glow Background Overlay for Sunny Weather (zIndex 1: behind all other layers) */}
      {weather === 'sunny' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 82% 16%, rgba(255, 251, 210, 0.26) 0%, rgba(255, 245, 200, 0.08) 45%, rgba(255, 255, 255, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 1,
          animation: 'sun-pulse 7s ease-in-out infinite',
          transformOrigin: '82% 16%',
        }} />
      )}

      {/* Rain Animation Layer (zIndex 3: behind text, in front of waves) */}
      {(weather === 'rain' || weather === 'tornado') && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 1,
        }}>
          {Array.from({ length: weather === 'tornado' ? 50 : 16 }).map((_, i) => {
            const left = `${(i * 100) / (weather === 'tornado' ? 50 : 16) + Math.random() * 6}%`;
            const delay = `${Math.random() * 1.2}s`;
            const duration = weather === 'tornado' 
              ? `${0.25 + Math.random() * 0.2}s`
              : `${0.5 + Math.random() * 0.3}s`;
            const opacity = weather === 'tornado'
              ? 0.25 + Math.random() * 0.45
              : 0.15 + Math.random() * 0.35;
            const height = weather === 'tornado'
              ? `${25 + Math.random() * 15}px`
              : `${15 + Math.random() * 10}px`;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: -25,
                  left,
                  width: weather === 'tornado' ? '1.5px' : '1px',
                  height,
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.65))',
                  animation: `${weather === 'tornado' ? 'tornado-rain-fall' : 'rain-fall'} ${duration} linear infinite`,
                  animationDelay: delay,
                  opacity,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Top Section */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        {/* Weather image - top right */}
        <img
          src={cfg.img}
          alt={cfg.label}
          style={{
            position: 'absolute', 
            top: cfg.iconTop ?? -12, 
            right: cfg.iconRight ?? 16, 
            width: iconSize, 
            height: iconSize, 
            objectFit: 'contain',
            opacity: 0.95,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
          }}
        />

        {/* Total asset badge & amount */}
        <div style={{
          display: 'inline-block',
          background: sharedOverlayBg,
          padding: '0 0 6px',
          fontSize: 11,
          fontWeight: 600,
          opacity: 0.85,
        }}>
          총 자산
        </div>
        
        <p style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.1 }}>
          {fmtM(total)}<span style={{ fontSize: 15, fontWeight: 500, marginLeft: 2 }}>원</span>
        </p>
      </div>

      {/* Middle Section: Weekly spending */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        background: sharedOverlayBg, 
        margin: '14px 0 0',
        padding: 0,
      }}>
        <p style={{
          margin: '0 0 8px',
          fontSize: 10,
          fontWeight: 600,
          opacity: 0.85,
          color: '#fff',
          textAlign: 'left'
        }}>
          이번 주 요일별 지출
        </p>

        <div style={{ display: 'flex', gap: 6 }}>
          {weekdays.map(w => (
            <div key={w.label} style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ 
                margin: '0 0 3px', 
                fontSize: 9, 
                opacity: w.isToday ? 1 : 0.6, 
                fontWeight: w.isToday ? 700 : 400,
                color: '#fff' 
              }}>{w.label}</p>
              <div style={{
                height: 26, borderRadius: 6,
                background: w.isToday ? '#fff' : 'rgba(255,255,255,0.16)',
                border: w.isToday ? '1.5px solid rgba(255,255,255,0.95)' : '1px solid rgba(255,255,255,0.05)',
                boxShadow: w.isToday ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ 
                  fontSize: 9, 
                  fontWeight: w.isToday ? 800 : 700, 
                  color: w.isToday ? '#0f172a' : '#fff' 
                }}>{fmtM(w.amt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Wave, Pori and Boat */}
      <div style={{ 
        position: 'relative', 
        margin: '0 -20px',
        height: 105, // reduced to shrink the wave vertically
        pointerEvents: 'none',
        zIndex: 2
      }}>
        {/* Wave Background Container (with overflow hidden) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}>
          {/* Wave Background */}
          <img 
            src={weather === 'tornado' ? wave2Img : waveImg} 
            alt="Wave" 
            className="animate-wave"
            style={{
              position: 'absolute',
              bottom: -6,
              left: '-30%',
              width: '160%',
              maxWidth: 'none',
              height: '110%',
              objectFit: 'cover', 
              opacity: 0.95,
            }}
          />
        </div>

        {/* Vehicle + Pori: 하나의 그룹 또는 단일 이미지 (outside overflow hidden, allowing vertical overflow) */}
        <div
          className="animate-vehicle"
          style={{
            position: 'absolute',
            bottom: cfg.bottomOffset ?? 8,
            left: 32,
            width: vehicleSize,
            height: vehicleSize,
            zIndex: 4,
          }}
        >
          {cfg.combinedImg ? (
            <img
              src={cfg.combinedImg}
              alt="Pori on Vehicle"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15)) drop-shadow(0 0 8px rgba(255,255,255,0.5))',
              }}
            />
          ) : (
            <>
              {/* Vehicle (배/카약/구명환) */}
              {cfg.vehicleImg && (
                <img
                  src={cfg.vehicleImg}
                  alt="Vehicle"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12)) drop-shadow(0 0 6px rgba(255,255,255,0.4))',
                  }}
                />
              )}
              {/* Pori: vehicle 기준 absolute → 배 위에 올라탄 느낌 */}
              {cfg.poriImg && cfg.poriOnVehicle && (
                <img
                  src={cfg.poriImg}
                  alt="Pori"
                  className="animate-pori"
                  style={{
                    position: 'absolute',
                    bottom: cfg.poriOnVehicle.bottom,
                    right: cfg.poriOnVehicle.right,
                    width: poriSize * cfg.poriOnVehicle.scale,
                    height: poriSize * cfg.poriOnVehicle.scale,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2)) drop-shadow(0 0 8px rgba(255,255,255,0.6))',
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
