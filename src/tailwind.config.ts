import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				neon: {
					purple: '#9b87f5',
					pink: '#D946EF',
					blue: '#0EA5E9',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0', opacity: '0' },
					to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
					to: { height: '0', opacity: '0' }
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '1', boxShadow: '0 0 5px rgba(155, 135, 245, 0.5)' },
					'50%': { opacity: '0.6', boxShadow: '0 0 20px rgba(155, 135, 245, 0.8)' }
				},
				'slide-in': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'wave': {
					'0%': { transform: 'scaleY(1)' },
					'50%': { transform: 'scaleY(0.5)' },
					'100%': { transform: 'scaleY(1)' }
				},
				'heartbeat': {
					'0%, 100%': { transform: 'scale(1)' },
					'25%': { transform: 'scale(1.1)' },
					'40%': { transform: 'scale(1)' },
					'60%': { transform: 'scale(1.1)' }
				},
				'ripple': {
					'0%': { transform: 'scale(0)', opacity: '0.8' },
					'100%': { transform: 'scale(4)', opacity: '0' }
				},
				'float-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-3px)' }
				},
				'twinkle': {
					'0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
					'50%': { opacity: '0.8', transform: 'scale(1.2)' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				'floatParticle': {
					'0%': { transform: 'translateY(0)', opacity: '0.7' },
					'100%': { transform: 'translateY(-100px)', opacity: '0' }
				},
				// New animations
				'pulse-shadow': {
					'0%, 100%': { boxShadow: '0 0 10px rgba(155, 135, 245, 0.5)' },
					'50%': { boxShadow: '0 0 20px rgba(155, 135, 245, 0.8)' }
				},
				'rotate-3d': {
					'0%': { transform: 'perspective(1200px) rotateY(0deg)' },
					'100%': { transform: 'perspective(1200px) rotateY(360deg)' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'fade-in-scale': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'float-lr': {
					'0%, 100%': { transform: 'translateX(0)' },
					'50%': { transform: 'translateX(10px)' }
				},
				'glimmer': {
					'0%': { backgroundPosition: '200% center', opacity: '0.2' },
					'100%': { backgroundPosition: '-200% center', opacity: '0.5' }
				},
				// Adding new animations for requested features
				'tilt': {
					'0%, 100%': { transform: 'perspective(600px) rotateY(0deg)' },
					'50%': { transform: 'perspective(600px) rotateY(3deg)' }
				},
				'explosion': {
					'0%': { transform: 'scale(0)', opacity: '0.8' },
					'100%': { transform: 'scale(3)', opacity: '0' }
				},
				'progress-pulse': {
					'0%, 100%': { transform: 'scaleX(1)' },
					'50%': { transform: 'scaleX(1.05)' }
				},
				'heart-pop': {
					'0%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.4)' },
					'100%': { transform: 'scale(1)' }
				},
				// New additional animations
				'float': {
					'0%': { transform: 'translateY(0) rotate(0deg)' },
					'50%': { transform: 'translateY(-20px) rotate(10deg)' },
					'100%': { transform: 'translateY(0) rotate(0deg)' }
				},
				'float-liquid': {
					'0%': { transform: 'translateY(0) scale(1)', opacity: '0.7' },
					'100%': { transform: 'translateY(-30px) scale(0)', opacity: '0' }
				},
				'floatUpwards': {
					'0%': { transform: 'translateY(0)', opacity: '0.7' },
					'100%': { transform: 'translateY(-50px)', opacity: '0' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.7', transform: 'scale(0.97)' }
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
				},
				'jelly': {
					'0%, 100%': { transform: 'scale(1)' },
					'25%': { transform: 'scale(0.95, 1.05)' },
					'50%': { transform: 'scale(1.05, 0.95)' },
					'75%': { transform: 'scale(0.98, 1.02)' }
				},
				'spotlight': {
					'0%': { opacity: '0', transform: 'translate(-72%, -62%) scale(0.5)' },
					'33%': { opacity: '1' },
					'66%': { opacity: '1' },
					'100%': { opacity: '0', transform: 'translate(72%, 62%) scale(0.5)' }
				},
				'gradient-animation': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'flip-in': {
					'0%': { transform: 'rotateY(90deg)', opacity: '0' },
					'100%': { transform: 'rotateY(0deg)', opacity: '1' }
				},
				'flip-out': {
					'0%': { transform: 'rotateY(0deg)', opacity: '1' },
					'100%': { transform: 'rotateY(90deg)', opacity: '0' }
				},
				'spin-3d': {
					'0%': { transform: 'rotate3d(0, 1, 0, 0deg)' },
					'50%': { transform: 'rotate3d(0, 1, 0, 180deg)' },
					'100%': { transform: 'rotate3d(0, 1, 0, 360deg)' }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'slide-in': 'slide-in 0.3s ease-out',
				'wave': 'wave 1.2s ease-in-out infinite',
				'heartbeat': 'heartbeat 1s ease-in-out',
				'ripple': 'ripple 1s cubic-bezier(0, 0, 0.2, 1) forwards',
				'float-subtle': 'float-subtle 3s ease-in-out infinite',
				'twinkle': 'twinkle 2s ease-in-out infinite',
				'pulse-slow': 'pulse-slow 3s infinite',
				'floatParticle': 'floatParticle 3s linear infinite',
				// New animations
				'pulse-shadow': 'pulse-shadow 2.5s infinite',
				'rotate-3d': 'rotate-3d 8s linear infinite',
				'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
				'fade-in-scale': 'fade-in-scale 0.5s forwards',
				'float-lr': 'float-lr 3s ease-in-out infinite',
				'glimmer': 'glimmer 3s linear infinite',
				// Adding new animation classes for requested features
				'tilt': 'tilt 5s ease-in-out infinite',
				'explosion': 'explosion 0.6s ease-out forwards',
				'progress-pulse': 'progress-pulse 2s infinite',
				'heart-pop': 'heart-pop 0.3s ease-out',
				// New additional animations
				'float': 'float 10s ease-in-out infinite',
				'float-liquid': 'float-liquid 1.5s ease-out forwards',
				'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
				'shake': 'shake 0.8s cubic-bezier(.36,.07,.19,.97) both',
				'jelly': 'jelly 0.5s',
				'spotlight': 'spotlight 2s ease .75s 1 forwards',
				'gradient-animation': 'gradient-animation 3s ease infinite',
				'flip-in': 'flip-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
				'flip-out': 'flip-out 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
				'spin-3d': 'spin-3d 3s linear infinite',
			},
			// Add transformStyle for 3D effects
			transformStyle: {
				'flat': 'flat',
				'3d': 'preserve-3d'
			},
			// Add perspective for 3D transformations
			perspective: {
				'none': 'none',
				'500': '500px',
				'600': '600px',
				'800': '800px',
				'1000': '1000px',
				'1200': '1200px'
			},
			// Add rotate for 3D transformations
			rotate: {
				'y-1': 'rotateY(1deg)',
				'y-2': 'rotateY(2deg)',
				'y-3': 'rotateY(3deg)',
				'y-6': 'rotateY(6deg)',
				'x-1': 'rotateX(1deg)',
				'x-2': 'rotateX(2deg)',
				'x-3': 'rotateX(3deg)',
				'x-6': 'rotateX(6deg)',
			},
			// Add backdrop blur classes
			backdropBlur: {
				'xs': '2px',
				'sm': '4px',
				'md': '8px',
				'lg': '12px',
				'xl': '16px',
				'2xl': '24px',
			},
			// Add transition durations
			transitionDuration: {
				'2000': '2000ms',
				'3000': '3000ms',
				'4000': '4000ms',
				'5000': '5000ms',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
