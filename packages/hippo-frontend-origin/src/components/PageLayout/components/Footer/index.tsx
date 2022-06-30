import { Antd } from 'components';

import { DiscordIcon, GithubIcon, DocsIcon, MediumIcon, TwitterIcon } from 'resources/icons';

const { Footer } = Antd.Layout;

const URLs = {
  discord: 'https://discord.gg/2WcHppqxuH',
  github: 'https://github.com/hippospace',
  docs: '/',
  medium: 'https://medium.com/@hippolabs',
  twitter: 'https://twitter.com/hippolabs__'
};

const Link = ({ href, children }: { href: string; children: any }) => {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={href}
      className="flex header5 bold text-grey-900 opacity-50 gap-2 hover:text-grey-900 hover:opacity-100">
      {children}
    </a>
  );
};

const PageFooter: React.FC = () => {
  return (
    <Footer className="flex gap-8 justify-center py-16 bg-transparent">
      <Link href={URLs.discord}>
        <DiscordIcon />
        Discord
      </Link>
      <Link href={URLs.medium}>
        <MediumIcon />
        Medium
      </Link>
      <Link href={URLs.twitter}>
        <TwitterIcon />
        Twitter
      </Link>
      <Link href={URLs.github}>
        <GithubIcon />
        Github
      </Link>
      <Link href={URLs.docs}>
        <DocsIcon />
        Docs
      </Link>
    </Footer>
  );
};

export default PageFooter;
