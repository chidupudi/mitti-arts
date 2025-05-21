import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Typography, 
  Button, 
  Input, 
  Divider,
  Space,
  BackTop
} from 'antd';
import { 
  InstagramOutlined, 
  FacebookOutlined, 
  TwitterOutlined, 
  YoutubeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text, Link } = Typography;

const Footer = () => {
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing with: ${email}`);
    setEmail('');
  };

  // Color palette based on terracotta
  const colors = {
    terracotta: '#E07A5F',
    terracottaDark: '#c75439',
    terracottaLight: '#f3c5b8',
    cream: '#F2EAE2',
    brown: '#5E4B3F',
    darkBrown: '#3D2F27'
  };

  // Custom styles for consistent theming
  const styles = {
    container: {
      backgroundColor: colors.darkBrown,
      color: colors.cream,
      paddingTop: 48,
      paddingBottom: 32,
      marginTop: 64,
      position: 'relative',
    },
    topBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '8px',
      background: `linear-gradient(90deg, ${colors.terracotta}, ${colors.terracottaLight}, ${colors.terracotta})`
    },
    sectionTitle: {
      color: colors.terracotta,
      fontFamily: '"Playfair Display", serif',
      marginBottom: 16,
      fontSize: 18,
      fontWeight: 'bold'
    },
    socialIcon: {
      color: colors.terracotta,
      fontSize: 18,
      marginRight: 16,
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: colors.terracottaLight
      }
    },
    link: {
      color: colors.cream,
      marginBottom: 12,
      display: 'block',
      transition: 'all 0.3s',
      '&:hover': {
        color: colors.terracotta,
        paddingLeft: 8
      }
    },
    contactIcon: {
      color: colors.terracotta,
      fontSize: 16,
      marginRight: 8
    },
    subscribeBtn: {
      backgroundColor: colors.terracotta,
      borderColor: colors.terracotta,
      '&:hover': {
        backgroundColor: colors.terracottaDark,
        borderColor: colors.terracottaDark,
      }
    },
    bottomText: {
      color: 'rgba(242, 234, 226, 0.7)',
      fontSize: 14
    },
    footerLink: {
      color: 'rgba(242, 234, 226, 0.7)',
      fontSize: 14,
      marginLeft: 16,
      '&:hover': {
        color: colors.terracotta
      }
    },
    backTopBtn: {
      backgroundColor: colors.terracotta,
      color: colors.cream,
      borderRadius: '50%',
      height: 40,
      width: 40,
      lineHeight: '40px',
      textAlign: 'center',
      fontSize: 16,
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    }
  };

  return (
    <div style={styles.container}>
      {/* Top decorative border */}
      <div style={styles.topBorder} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        <Row gutter={[48, 32]}>
          {/* Company info */}
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={styles.sectionTitle}>
              Mitti Arts
            </Title>
            <Paragraph style={{ color: colors.cream, marginBottom: 16 }}>
              Handcrafted clay pottery reflecting earth's beauty. 
              Every piece tells a story of tradition and artistry.
            </Paragraph>
            <Space style={{ marginTop: 24 }}>
              <a href="https://www.instagram.com/_mitti_arts_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
                <InstagramOutlined style={{ ...styles.socialIcon, '&:hover': { color: colors.terracottaLight } }} />
              </a>
              <a href="https://wa.me/message/YKBIWZC3P6D7M1" target="_blank" rel="noopener noreferrer">
                <PhoneOutlined style={{ ...styles.socialIcon, '&:hover': { color: colors.terracottaLight } }} />
              </a>
              <a href="https://youtube.com/@mittiarts?feature=shared" target="_blank" rel="noopener noreferrer">
                <YoutubeOutlined style={{ ...styles.socialIcon, '&:hover': { color: colors.terracottaLight } }} />
              </a>
            </Space>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={styles.sectionTitle}>
              QUICK LINKS
            </Title>
            <div>
              {[
                {text: 'Home', link: '/'},
                {text: 'Shop', link: '/products'},
                {text: 'About Us', link: '/about'},

                {text: 'Contact', link: '/contactus'}
              ].map((item) => (
                <Link
                  key={item.text}
                  href={item.link}
                  style={styles.link}
                >
                  {item.text}
                </Link>
              ))}
            </div>
          </Col>

          {/* Contact Information */}
          <Col xs={24} sm={12} md={6}>
            <Title level={5} style={styles.sectionTitle}>
              CONTACT US
            </Title>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Space align="start">
                <EnvironmentOutlined style={styles.contactIcon} />
                <Text style={{ color: colors.cream }}>
                 Art of Indian pottery (Mittiarts)
Plot no 3,
Opp to maisamma temple ,
                  <br />
           Near Ramoji Film City , abdullapurmet, Ranga Reddy,
Telangana, 501505
                </Text>
              </Space>
              <Space>
                <PhoneOutlined style={styles.contactIcon} />
                <Text style={{ color: colors.cream }}>
                 91 7382150250
                </Text>
              </Space>
              <Space>
                <MailOutlined style={styles.contactIcon} />
                <Text style={{ color: colors.cream }}>
                 mittiarts0@gmail.com
                </Text>
              </Space>
            </Space>
          </Col>

        </Row>

        <Divider style={{ borderColor: 'rgba(242, 234, 226, 0.2)', margin: '32px 0' }} />
        
        <Row justify="space-between" align="middle" gutter={[0, 16]}>
          <Col xs={24} sm={12}>
            <Text style={styles.bottomText}>
              © {new Date().getFullYear()} Mitti Arts. All rights reserved.
            </Text>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
            {['Privacy Policy', 'Terms of Service', 'Shipping Info'].map((text, index) => (
              <Link
                key={text}
                href="/policies"
                style={{
                  ...styles.footerLink,
                  marginLeft: index === 0 ? 0 : 16
                }}
              >
                {text}
              </Link>
            ))}
          </Col>
        </Row>
      </div>

      {/* Back to top button */}
      <BackTop>
        <div style={styles.backTopBtn}>
          <ArrowUpOutlined />
        </div>
      </BackTop>
    </div>
  );
};

export default Footer;