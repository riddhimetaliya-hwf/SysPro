
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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
					active: 'hsl(var(--primary-active))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					hover: 'hsl(var(--secondary-hover))'
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
				jobs: {
				  noConflict: 'hsl(var(--job-no-conflict))',
				  capacityConflict: 'hsl(var(--job-capacity-conflict))',
				  materialConflict: 'hsl(var(--job-material-conflict))',
				  resourceConflict: 'hsl(var(--job-resource-conflict))',
				  dependency: 'hsl(var(--job-dependency))'
				},
				manufacturing: {
					operational: 'hsl(var(--machine-operational))',
					maintenance: 'hsl(var(--machine-maintenance))',
					offline: 'hsl(var(--machine-offline))',
					setup: 'hsl(var(--machine-setup))'
				},
				priority: {
					critical: 'hsl(var(--priority-critical))',
					high: 'hsl(var(--priority-high))',
					medium: 'hsl(var(--priority-medium))',
					low: 'hsl(var(--priority-low))'
				},
				material: {
					inStock: 'hsl(var(--material-in-stock))',
					lowStock: 'hsl(var(--material-low-stock))',
					outStock: 'hsl(var(--material-out-stock))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				critical: {
					DEFAULT: 'hsl(var(--critical))',
					foreground: 'hsl(var(--critical-foreground))'
				},
				production: {
					DEFAULT: 'hsl(var(--production))',
					foreground: 'hsl(var(--production-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))'
				},
				status: {
					pending: 'hsl(var(--status-pending))',
					progress: 'hsl(var(--status-progress))',
					complete: 'hsl(var(--status-complete))',
					delayed: 'hsl(var(--status-delayed))'
				}
			},
			borderRadius: {
				'xs': '2px',
				'sm': '6px',
				'DEFAULT': '12px',
				'lg': '16px',
				'xl': '20px',
				'2xl': '24px',
				'3xl': '32px'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				jakarta: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'Roboto Mono', 'monospace'],
				display: ['Roboto', 'Inter', 'system-ui', 'sans-serif'],
				body: ['Inter', 'system-ui', 'sans-serif']
			},
			fontSize: {
				// Enhanced typography scale for production UI
				'2xs': ['0.625rem', { lineHeight: '0.875rem', fontWeight: '400' }],
				'xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
				'base': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
				'2xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
				'5xl': ['3rem', { lineHeight: '1.2', fontWeight: '800' }],
				'6xl': ['3.75rem', { lineHeight: '1.1', fontWeight: '800' }],
				// Specialized sizes for production metrics
				'metric-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
				'metric-base': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '700' }],
				'metric-lg': ['1.5rem', { lineHeight: '1.75rem', fontWeight: '800' }],
				'metric-xl': ['2.25rem', { lineHeight: '2.25rem', fontWeight: '900' }],
			},
			spacing: {
				'18': '4.5rem',
				'22': '5.5rem',
				'26': '6.5rem',
				'30': '7.5rem',
			},
			backdropBlur: {
				'xs': '2px',
				'sm': '4px',
				'md': '12px',
				'lg': '16px',
				'xl': '24px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				slideIn: {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				shimmer: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				bounce: {
					'0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
					'50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'fade-in': 'fadeIn 0.4s ease-out',
				'slide-in': 'slideIn 0.4s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'shimmer': 'shimmer 2s infinite',
				'bounce': 'bounce 1s infinite'
			},
			gridTemplateColumns: {
				'sidebar': '250px 1fr',
				'sidebar-collapsed': '60px 1fr',
			},
			boxShadow: {
				'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
				'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
				'card-elevated': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
				'inner-soft': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
				'glow': '0 0 20px rgb(99 102 241 / 0.3)',
				'soft': '0 2px 8px rgb(0 0 0 / 0.04)',
				'medium': '0 4px 16px rgb(0 0 0 / 0.08)',
				'strong': '0 8px 32px rgb(0 0 0 / 0.12)'
			},
			zIndex: {
				'dropdown': '1000',
				'sticky': '100',
				'banner': '90',
				'overlay': '80',
				'modal': '70',
				'popover': '60',
				'tooltip': '50',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
