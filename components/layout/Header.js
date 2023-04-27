import styled from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiInfo, FiCompass, FiPlusSquare, FiUser, FiBarChart2 } from 'react-icons/fi';
import Wallet from './Wallet';

const Header = () => {
  const Router = useRouter();

  return (
  
    <HeaderContainer>
      <LogoContainer>
        <Logo>Kavons Dapp</Logo>
      </LogoContainer>

      <NavigationMenu>
        <Link href="/ourStory">
          <NavItem active={Router.pathname == '/ourStory'}>
            <FiInfo size={18} />
          </NavItem>
        </Link>
        

        <Link href="/">
          <NavItem active={Router.pathname == '/'}>
            <FiCompass size={18} />
          </NavItem>
        </Link>

        <Link href="/createcampaign">
          <NavItem active={Router.pathname == '/createCampaign'}>
            <FiPlusSquare size={18} />
          </NavItem>
        </Link>

        <Link href="/mycampaigns">
          <NavItem active={Router.pathname == '/myCampaigns'}>
            <FiUser size={18} />
          </NavItem>
        </Link>
      
        
      </NavigationMenu>
      
      <WalletContainer>
      <Link href="/admin">
  <NavItem active={Router.pathname == '/adminControl'}>
    <FiBarChart2 size={18} />
  </NavItem>
</Link>
        <Wallet />
      </WalletContainer>
    </HeaderContainer>

  );
};

const HeaderContainer = styled.div`
  width: 100%;
  
  height: 75px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${(props) => props.theme.bgDiv};
  padding: 0 24px;
  
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.h1`
  font-weight: bold;
  font-size: 28px;
  font-family: 'Bebas Neue', cursive;
  letter-spacing: 2px;
  color: #0074d9;
  margin: 0;
`;

const NavigationMenu = styled.div`
  display: flex;
  align-items: center;
`;

const NavItem = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-left: 24px;
  border-radius: 50%;
  color: ${(props) => (props.active ? '#fff' : '#0074d9')};
  background-color: ${(props) => (props.active ? '#0074d9' : 'transparent')};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19);
  }
`;

const WalletContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 40px;
`;



export default Header;