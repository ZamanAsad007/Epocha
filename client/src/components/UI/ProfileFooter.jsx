import { FaFacebook, FaGithub } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

const SOCIAL_LINKS = {
  github: 'https://github.com/zamanasad007',
  facebook: 'https://facebook.com/zaman.asad.69',
  gmail: 'mailto:asadasif1704@gmail.com',
};

const iconButtonBase =
  'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200';

const ProfileFooter = () => {
  return (
    <footer
      className="w-full mt-auto"
      style={{
        borderTop: '1px solid #2A2720',
        backgroundColor: '#0D0D0D',
      }}
    >
      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col items-center gap-4">
        <div className="flex items-center justify-between w-full gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '16px',
                fontWeight: '600',
                color: '#C9A84C',
                letterSpacing: '0.15em',
              }}
            >
              EPOCHA
            </span>
            <span style={{ color: '#2A2720', fontSize: '14px' }}>|</span>
            <span
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '12px',
                color: '#5C5347',
                letterSpacing: '0.05em',
              }}
            >
              Explore History
            </span>
          </div>

          <div className="flex items-center gap-1">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`${iconButtonBase} group`}
              style={{ color: '#5C5347' }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = '#C9A84C';
                event.currentTarget.style.backgroundColor = '#C9A84C15';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = '#5C5347';
                event.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="GitHub"
              aria-label="GitHub"
            >
              <FaGithub size={18} />
            </a>

            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className={iconButtonBase}
              style={{ color: '#5C5347' }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = '#2980B9';
                event.currentTarget.style.backgroundColor = '#2980B915';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = '#5C5347';
                event.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Facebook"
              aria-label="Facebook"
            >
              <FaFacebook size={18} />
            </a>

            <a
              href={SOCIAL_LINKS.gmail}
              className={iconButtonBase}
              style={{ color: '#5C5347' }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = '#C0392B';
                event.currentTarget.style.backgroundColor = '#C0392B15';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = '#5C5347';
                event.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Gmail"
              aria-label="Gmail"
            >
              <MdEmail size={20} />
            </a>
          </div>
        </div>

        <div
          className="w-full h-px"
          style={{
            background: 'linear-gradient(to right, transparent, #2A2720, transparent)',
          }}
        />

        <div className="flex items-center justify-between w-full gap-4 flex-wrap">
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '11px',
              color: '#5C5347',
              letterSpacing: '0.03em',
            }}
          >
            © {new Date().getFullYear()} Epocha. All rights reserved.
          </p>

          <p
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '11px',
              color: '#3A3530',
              fontStyle: 'italic',
            }}
          >
            History is everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ProfileFooter;