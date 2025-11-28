export default class Elements {
	themeToggleDesktop = () => cy.get('[data-cy="theme-toggle-desktop"]');
  themeToggleMobile = () => cy.get('[data-cy="theme-toggle-mobile"]');
  closeWelcomeModal = () => cy.get("#hideInfoModal");

  footerLinks = [
    { id: 'discord-link', text: 'Discord', href: 'https://discord.gg/MhYP7w8n8p' },
    { id: 'twitter-link', text: 'Twitter', href: 'https://x.com/artifi_labs' },
    { id: 'github-link', text: 'Github', href: 'https://github.com/artifi-labs/open-djed' },
    { id: 'djed-link', text: 'djed.xyz', href: 'https://djed.xyz' },
    { id: 'status-link', text: 'Status', href: 'https://status.artifi.finance/' },
    { id: 'terms-link', text: 'Terms', href: '/terms' },
    { id: 'privacy-link', text: 'Privacy', href: '/privacy' },
  ];
}