import type { SVGProps } from "react";

type NutProps = SVGProps<SVGSVGElement>;

export function Cashew(props: NutProps) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden {...props}>
      <path
        d="M30 28c22-16 58-14 72 10 12 22 6 54-18 66-8 4-16 0-15-8 1-9 10-12 13-22 4-14-4-26-18-28-11-2-20 4-28 2-10-3-14-14-6-20z"
        fill="#ecd29b"
        stroke="#b88c4a"
        strokeWidth="2"
      />
      <path d="M44 34c16-6 34-2 44 10" stroke="#fff6dc" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}

export function Almond(props: NutProps) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden {...props}>
      <path d="M60 8c26 18 38 48 30 74-6 20-20 30-30 30s-24-10-30-30C22 56 34 26 60 8z" fill="#b5713f" stroke="#7a4522" strokeWidth="2" />
      <path d="M60 22c-4 22-4 52 0 82M48 34c-4 18-4 40 2 60M72 34c4 18 4 40-2 60" stroke="#8f552c" strokeWidth="2" fill="none" opacity="0.6" />
    </svg>
  );
}

export function Pistachio(props: NutProps) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden {...props}>
      <ellipse cx="60" cy="60" rx="34" ry="46" fill="#e8dcc0" stroke="#b3a27c" strokeWidth="2" />
      <path d="M60 20c-14 10-20 26-20 40s6 30 20 40c14-10 20-26 20-40S74 30 60 20z" fill="#a4bc55" stroke="#6f8a35" strokeWidth="2" />
      <path d="M60 28c-6 10-8 20-8 32" stroke="#d6e59a" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function DateFruit(props: NutProps) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden {...props}>
      <ellipse cx="60" cy="60" rx="26" ry="48" fill="#5a2618" stroke="#3b170d" strokeWidth="2" />
      <path d="M48 24c-6 18-6 54 2 74M66 22c8 20 8 52 0 76" stroke="#7b3a22" strokeWidth="3" fill="none" />
      <ellipse cx="52" cy="36" rx="5" ry="12" fill="#a8583a" opacity="0.6" />
    </svg>
  );
}

export const NUTS = { Cashew, Almond, Pistachio, DateFruit };
