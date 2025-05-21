import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Fade
} from "@mui/material";
import { keyframes } from "@emotion/react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SecurityIcon from "@mui/icons-material/Security";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CircleIcon from "@mui/icons-material/Circle";

// Custom animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Policy section data with icons
const policySections = [
  {
    title: "Shipping Policy",
    icon: <LocalShippingIcon />,
    color: "#8a5a44",
    bgColor: "#fff9f5",
    points: [
      "Orders are delivered within 3-5 days after confirmation, depending on location and order volume.",
      "Delivery hours: Monday–Sunday: 11 am to 11 pm.",

      
    ]
  },
  {
    title: "Terms & Conditions",
    icon: <AssignmentIcon />,
    color: "#5e7a3c",
    bgColor: "#f5fff5",
    points: [
      "Welcome to Mitti Arts!(Telangana Shilpa Kala) These terms and conditions outline the rules and regulations for using our website and services.",
      "\"We\", \"us\", and \"our\" refer to Mitti Arts and its affiliates.",
      "\"You\" and \"your\" refer to the user of the website.",
      "You must be at least 18 years old to use our website.",
      "You agree to use our website for lawful purposes only.",
      "We offer handmade ceramic products and other artisanal goods.",
      "Product descriptions and prices are subject to change without notice.",
      "Payment terms are as stated on our website.",
      "We accept various payment methods.",
      "Shipping and delivery terms are as stated on our website.",
      "We strive to deliver products promptly and efficiently.",
      "Our return and refund policy is as stated on our website.",
      "Our website and its content are owned by us and are protected by intellectual property laws.",
      "Our website and products are provided on an \"as is\" and \"as available\" basis.",
      "We shall not be liable for any damages, including direct, indirect, incidental, special, or consequential damages.",
      "These terms and conditions shall be governed by and construed in accordance with the laws of India.",
      "We reserve the right to modify these terms and conditions at any time.",
      "If you have any questions or concerns please contact us."
    ]
  },
  {
    title: "Refund & Return",
    icon: <RefreshIcon />,
    color: "#7a623c",
    bgColor: "#fffaf0",
    points: [
      "Refunds are available for incorrect, missing, or poor-quality items.",
      "Refund requests must be made within 24 hours of receiving the order.",
      "Returns are not accepted due to the nature of product.",
      "No refunds for customer errors or external delivery delays.",
      "To request a refund, provide your order number, issue description, and photos.",
      "Approved refunds may be credited back within 7–10 days to the original method."
    ]
  },
  {
    title: "Privacy Policy",
    icon: <SecurityIcon />,
    color: "#3c5a7a",
    bgColor: "#f5faff",
    points: [
      "At Mitti Arts, we value your privacy and are committed to protecting your personal data. This privacy policy outlines how we collect, use, and safeguard your information.",
      "Personal data: name, email address, phone number, and shipping address.",
      "Payment information: credit/debit card details, billing address.",
      "Usage data: browsing history, IP address, device information.",
      "To process and fulfill orders.",
      "To communicate with you about your orders and promotions.",
      "To improve our website and services.",
      "We implement robust security measures to protect your data.",
      "We comply with applicable data protection laws and regulations.",
      "We may share your information with:",
      "Payment processors and banks.",
      "Shipping and delivery providers.",
      "Law enforcement agencies (if required by law).",
      "You have the right to:",
      "Access and update your personal data.",
      "Request data deletion or correction.",
      "Opt-out of marketing communications.",
      "We use cookies to enhance your browsing experience.",
      "You can manage cookie settings through your browser.",
      "We reserve the right to modify this privacy policy at any time."
    ]
  }
];

// Custom Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`policy-tabpanel-${index}`}
      aria-labelledby={`policy-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={value === index} timeout={800}>
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

// Custom list item component with animation
const AnimatedListItem = ({ text, index }) => {
  return (
    <ListItem 
      sx={{
        py: 1.2,
        animation: `${fadeIn} 0.5s ease ${index * 0.1}s both`,
        opacity: 0,
      }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        <CircleIcon sx={{ 
          fontSize: 10, 
          color: "primary.main",
          animation: `${pulse} 3s infinite ${index * 0.2}s`,
        }} />
      </ListItemIcon>
      <ListItemText 
        primary={text}
        primaryTypographyProps={{
          fontSize: "1rem",
          color: "#444",
          lineHeight: 1.6,
        }}
      />
    </ListItem>
  );
};

const Policies = () => {
  // State for tab management
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #fff9f5 0%, #f0e6d9 100%)",
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: "5%",
          left: "5%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(166,124,82,0.1) 0%, rgba(166,124,82,0) 70%)",
          zIndex: 0,
          display: { xs: "none", md: "block" }
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(166,124,82,0.08) 0%, rgba(166,124,82,0) 70%)",
          zIndex: 0,
          display: { xs: "none", md: "block" }
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            mb: { xs: 4, md: 6 },
            position: "relative",
            textAlign: "center",
            animation: `${fadeIn} 1s ease`,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "#5c3a1e",
              position: "relative",
              display: "inline-block",
              pb: 2,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: "30%",
                width: "40%",
                height: "3px",
                background: "linear-gradient(to right, transparent, #a67c52, transparent)",
              }
            }}
          >
            Our Policies
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#7a4b2c",
              maxWidth: "700px",
              margin: "0 auto",
              fontStyle: "italic",
              fontSize: { xs: "1rem", md: "1.1rem" },
            }}
          >
            Everything you need to know about our business practices and customer agreements
          </Typography>
        </Box>

        <Paper 
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: "#fff",
            animation: `${fadeIn} 0.8s ease 0.2s forwards`,
            opacity: 0,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Tabs section */}
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="policy tabs"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              backgroundColor: "#fcf8f3",
              "& .MuiTabs-indicator": {
                backgroundColor: policySections[currentTab].color,
                height: 3,
              },
              "& .MuiTab-root": {
                minHeight: { xs: 60, md: 72 },
                transition: "all 0.3s ease",
              },
            }}
          >
            {policySections.map((section, index) => (
              <Tab
                key={index}
                icon={React.cloneElement(section.icon, { 
                  style: { 
                    color: currentTab === index ? section.color : "#777", 
                    fontSize: 28,
                    marginBottom: 8
                  } 
                })}
                label={
                  <Typography 
                    sx={{ 
                      fontWeight: currentTab === index ? 600 : 400,
                      color: currentTab === index ? section.color : "#555",
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {section.title}
                  </Typography>
                }
                sx={{
                  "&.Mui-selected": {
                    backgroundColor: `${policySections[index].color}10`,
                  },
                  "&:hover": {
                    backgroundColor: `${policySections[index].color}05`,
                  }
                }}
              />
            ))}
          </Tabs>

          {/* Tab content panels */}
          {policySections.map((section, index) => (
            <TabPanel key={index} value={currentTab} index={index}>
              <Box 
                sx={{ 
                  p: { xs: 2, md: 3 },
                  backgroundColor: `${section.bgColor}80`,
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    color: section.color,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  {React.cloneElement(section.icon, { 
                    style: { 
                      fontSize: 32,
                      marginRight: 12,
                      color: section.color,
                    } 
                  })}
                  {section.title}
                </Typography>
                <Typography sx={{ color: "#555", fontStyle: "italic" }}>
                  Last updated: April 10, 2025
                </Typography>
              </Box>
              
              <List sx={{ pt: 0 }}>
                {section.points.map((point, idx) => (
                  <AnimatedListItem key={idx} text={point} index={idx} />
                ))}
              </List>
            </TabPanel>
          ))}
        </Paper>

        <Box
          sx={{
            mt: { xs: 4, md: 6 },
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
            animation: `${fadeIn} 1s ease 1s forwards`,
            opacity: 0,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography variant="h6" sx={{ color: "#5c3a1e", fontWeight: 600, mb: 2 }}>
            Need More Information?
          </Typography>
          <Typography sx={{ color: "#7a4b2c", mb: 1 }}>
            Contact our customer support team for any policy-related queries (Telangana Shilpa Kala).
          </Typography>
          <Typography 
            sx={{ 
              fontWeight: 600, 
              color: "#a67c52",
              animation: `${pulse} 3s infinite`,
              display: "inline-block",
            }}
          >
            +91-7382150250 | mittiarts0@gmail.com
          </Typography>
        </Box>
        
        <Typography 
          align="center" 
          sx={{ 
            mt: 4, 
            mb: 2, 
            fontSize: 14, 
            color: "#7a4b2c",
            opacity: 0.8,
          }}
        >
          © {new Date().getFullYear()} Mitti Arts. All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Policies;