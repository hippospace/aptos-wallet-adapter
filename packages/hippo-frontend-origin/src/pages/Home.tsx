import { FC } from 'react';
import HomeTrade from 'resources/img/home-trade.png';
import HomeMoveToTs from 'resources/img/home-move-to-ts.png';
import HomeWalletInfra from 'resources/img/home-wallet-infra.png';
import HomeProactive from 'resources/img/home-proactive.png';
import HomeBlogPoster1 from 'resources/img/home-blog-poster-1.png';
import HomeBlogPoster2 from 'resources/img/home-blog-poster-2.png';
import BlogsAccessArrow from 'resources/icons/blogsAccessArrow.svg';
import Button from 'components/Button';
import classNames from 'classnames';

interface HomeBlogProps {
  posterSrc: string;
  title: string;
  summary: string;
  url: string;
}

const HomeBlog: FC<HomeBlogProps> = ({ posterSrc, title, summary, url }) => {
  return (
    <div className="flex-1 max-w-[380px] text-left px-6 py-5 border-4 border-solid border-primary shadow-figma">
      <div className="w-full aspect-w-16 aspect-h-9">
        <img src={posterSrc} className="w-full object-cover" />
      </div>
      {/* line-clamp will automatically truncate the text as boxes shrink but 'truncate' won't */}
      <div className="h5 mb-2 mt-4 w-full line-clamp-1 mobile:title bold">{title}</div>
      <div className="flex items-end justify-between  min-h-[88px]">
        <div className="title w-full line-clamp-4 mr-2 mobile:paragraph">{summary}</div>
        <Button
          variant="icon"
          onClick={() => {
            window.open(url, '_blank');
          }}>
          <img src={BlogsAccessArrow} className="w-14 h-14" />
        </Button>
      </div>
    </div>
  );
};

interface HomeIllustrationProps {
  label: string;
  imageSrc: string;
  className?: string;
  link?: string;
}

const HomeIllustration: FC<HomeIllustrationProps> = ({ imageSrc, label, className = '', link }) => {
  return (
    <div
      className={classNames(className, 'home-illu w-[296px]', { 'cursor-pointer group': !!link })}
      onClick={() => link && window.open(link, '_blank')}>
      <div>
        <img
          src={imageSrc}
          className="w-[220px] mx-auto group-hover:scale-110 transition-transform"
        />
      </div>
      <div className="font-bold text-2xl leading-7 mt-6 mobile:paragraph mobile:font-bold">
        {label}
      </div>
    </div>
  );
};

const SubTitle = ({ children }: { children: any }) => (
  <div className="h5 font-bold mb-12 mobile:h6 mobile:mb-6">{children}</div>
);

const Home = () => {
  const aboutIllus = [
    {
      label: 'Trade aggregation',
      imageSrc: HomeTrade
    },
    {
      label: 'Proactive Liquidity with Concentrated Liquidity Pools',
      imageSrc: HomeProactive
    }
  ];
  const offeringIllus = [
    {
      label: 'Move-to-Typescript Transpiler',
      imageSrc: HomeMoveToTs,
      link: 'https://github.com/hippospace/move-to-ts'
    },
    {
      label: 'Wallet Infrastructure',
      imageSrc: HomeWalletInfra,
      link: 'https://github.com/hippospace/aptos-wallet-adapter'
    }
  ];
  const blogs: HomeBlogProps[] = [
    {
      posterSrc: HomeBlogPoster1,
      title: 'Introducing Hippo — The Aptos Aggregation Layer',
      summary:
        'We’re not just your run-of-the-mill aggregator though; the way we work is a bit different: Hippo provides developers with tools at the compiler, SDK, and framework-level to dramatically increase their productivity. Ultimately, we provide improved product discoverability, interoperability, in aggregate by default.',
      url: 'https://medium.com/@hippolabs/introducing-hippo-the-aptos-aggregation-layer-caefc1a7fc2d'
    },
    {
      posterSrc: HomeBlogPoster2,
      title: 'Title placeholder 2',
      summary:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam iaculis pretium ultrices. Pellentesque habitant morbi tristique senectus et netus et...',
      url: ''
    }
  ];
  return (
    <div className="hippo-home text-center mx-auto  max-w-[1570px]">
      <div className="hippo-home__about mb-56 mobile:mb-32">
        <div className="font-bold text-[80px] mb-24 laptop:text-[68px] tablet:text-[56px] mobile:h5 mobile:mb-16">
          Trade with best rates on Aptos
        </div>
        <div className="flex justify-evenly items-start tablet:flex-col tablet:gap-y-8 tablet:items-center">
          {aboutIllus.map((ilu, index) => (
            <HomeIllustration {...ilu} key={`illu-${index}`} />
          ))}
        </div>
      </div>
      <div className="hippo-home__offerings mb-56 mobile:mb-32">
        <div className="h1 mb-24 max-w-[1108px] mx-auto mobile:h5 mobile:mb-16">
          Boost dev productivity with best tooling
        </div>
        <div className="flex justify-evenly items-start tablet:flex-col tablet:gap-y-8 tablet:items-center">
          {offeringIllus.map((ilu, index) => (
            <HomeIllustration {...ilu} key={`illu-${index}`} />
          ))}
        </div>
      </div>
      <div className="hippo-home__blogs">
        <SubTitle>Blogs</SubTitle>
        <div className="flex justify-center items-center gap-x-16 tablet:flex-col tablet:gap-y-8">
          {blogs.map((bl, index) => (
            <HomeBlog {...bl} key={`k-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
