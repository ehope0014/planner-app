// Hand-drawn style olive branch used as Planora's signature illustration.
// Pass `animate` to draw the lines in once on page load (respects reduced motion).
export default function Sprig({ className = "", animate = false }) {
  return (
    <svg
      viewBox="0 -10 200 360"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`${animate ? "sprig-draw " : ""}${className}`}
    >
      <path pathLength="1" d="M30,340 C110,260 40,130 140,10" />
      <path pathLength="1" transform="translate(46.5 319.9) rotate(-96.5)" d="M0 0C13.8 -10.1 32.2 -11.1 46 0C32.2 9.1 13.8 10.1 0 0Z" />
      <path pathLength="1" transform="translate(46.5 319.9) rotate(-96.5)" d="M3 0Q23 -1 37.7 0" />
      <path pathLength="1" transform="translate(58.4 297.4) rotate(-27.2)" d="M0 0C13 -9.5 30.4 -10.5 43.4 0C30.4 8.6 13 9.5 0 0Z" />
      <path pathLength="1" transform="translate(58.4 297.4) rotate(-27.2)" d="M3 0Q21.7 -1 35.6 0" />
      <path pathLength="1" transform="translate(66.4 273.4) rotate(-115.6)" d="M0 0C12.2 -9 28.6 -9.9 40.8 0C28.6 8.1 12.2 9 0 0Z" />
      <path pathLength="1" transform="translate(66.4 273.4) rotate(-115.6)" d="M3 0Q20.4 -1 33.5 0" />
      <path pathLength="1" transform="translate(71.5 247.9) rotate(-41.3)" d="M0 0C11.5 -8.4 26.7 -9.2 38.2 0C26.7 7.6 11.5 8.4 0 0Z" />
      <path pathLength="1" transform="translate(71.5 247.9) rotate(-41.3)" d="M3 0Q19.1 -1 31.3 0" />
      <path pathLength="1" transform="translate(74.7 221.2) rotate(-124.4)" d="M0 0C10.7 -7.8 24.9 -8.6 35.6 0C24.9 7 10.7 7.8 0 0Z" />
      <path pathLength="1" transform="translate(74.7 221.2) rotate(-124.4)" d="M3 0Q17.8 -1 29.2 0" />
      <path pathLength="1" transform="translate(77.2 193.4) rotate(-45.1)" d="M0 0C9.9 -7.3 23.1 -8 33 0C23.1 6.5 9.9 7.3 0 0Z" />
      <path pathLength="1" transform="translate(77.2 193.4) rotate(-45.1)" d="M3 0Q16.5 -1 27.1 0" />
      <path pathLength="1" transform="translate(79.9 164.9) rotate(-123.6)" d="M0 0C9.1 -6.7 21.3 -7.4 30.4 0C21.3 6 9.1 6.7 0 0Z" />
      <path pathLength="1" transform="translate(79.9 164.9) rotate(-123.6)" d="M3 0Q15.2 -1 24.9 0" />
      <path pathLength="1" transform="translate(84 135.7) rotate(-40.2)" d="M0 0C8.3 -6.1 19.5 -6.7 27.8 0C19.5 5.5 8.3 6.1 0 0Z" />
      <path pathLength="1" transform="translate(84 135.7) rotate(-40.2)" d="M3 0Q13.9 -1 22.8 0" />
      <path pathLength="1" transform="translate(90.5 106) rotate(-115)" d="M0 0C7.6 -5.5 17.6 -6.1 25.2 0C17.6 5 7.6 5.5 0 0Z" />
      <path pathLength="1" transform="translate(90.5 106) rotate(-115)" d="M3 0Q12.6 -1 20.7 0" />
      <path pathLength="1" transform="translate(100.4 76.2) rotate(-28.2)" d="M0 0C6.8 -5 15.8 -5.5 22.6 0C15.8 4.5 6.8 5 0 0Z" />
      <path pathLength="1" transform="translate(100.4 76.2) rotate(-28.2)" d="M3 0Q11.3 -1 18.5 0" />
      <path pathLength="1" transform="translate(114.8 46.2) rotate(-100.3)" d="M0 0C6 -4.4 14 -4.8 20 0C14 4 6 4.4 0 0Z" />
      <path pathLength="1" transform="translate(114.8 46.2) rotate(-100.3)" d="M3 0Q10 -1 16.4 0" />
      <path pathLength="1" transform="translate(140 10) rotate(-50.2)" d="M0 0C6 -4 14 -4 20 0C14 4 6 4 0 0Z" />
    </svg>
  );
}
