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
  Fade,
  Alert,
  AlertTitle
} from "@mui/material";
import { keyframes } from "@emotion/react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SecurityIcon from "@mui/icons-material/Security";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CircleIcon from "@mui/icons-material/Circle";
import TempleHinduIcon from "@mui/icons-material/TempleHindu";
import HandymanIcon from "@mui/icons-material/Handyman";

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

// Policy section data with icons - Updated with Ganesh Idol Terms
const policySections = [
  {
    title: "Shipping Policy",
    icon: <LocalShippingIcon />,
    color: "#8a5a44",
    bgColor: "#fff9f5",
    points: [
      "Orders are delivered within 3-5 days after confirmation, depending on location and order volume.",
      "Delivery hours: Monday–Sunday: 11 am to 11 pm.",
      "For Ganesh idols 3 feet and taller (weighing 30-200 kg), customer must arrange 3-4 persons to assist our delivery team.",
      "Large idols require special handling - our team will coordinate delivery timing with you.",
      "Fragile products require careful handling - detailed instructions provided upon delivery.",
      "Free delivery available for orders above certain value (terms apply)."
    ]
  },
  {
    title: "Ganesh Idol Terms",
    icon: <TempleHinduIcon />,
    color: "#FF6B35",
    bgColor: "#fff5f0",
    points: [
      "🕉️ THE ART OF UNIQUENESS: HANDCRAFTED IDOLS",
      "Individual Artistic Touch: Our skilled artisans pour their heart into every Ganesha idol. Details like eyes and bindi may vary slightly, making each piece unique.",
      "These variations aren't imperfections - they're the artist's signature, adding charm and authenticity to your Ganesha.",
      "Natural Clay Characteristics: Made from pure Ganga clay, you might notice minimal hairline cracks - these are natural and don't affect integrity.",
      "Size Variations: Due to natural clay properties and climatic conditions, final size may vary by 1-2 inches from listed dimensions.",
      "🙏 HANDLING AND DELIVERY INFORMATION",
      "Fragile Product - Handle with Care: Your Ganesha is delicate art. Never lift by hands or trunk - always support the main body.",
      "Delivery Assistance Required: For 3+ feet idols (30-200 kg), arrange 3-4 people to assist our delivery team for safe handling.",
      "Special Delivery Coordination: Large idols require scheduled delivery with advance notice for proper preparation.",
      "📦 CANCELLATION POLICY",
      "24-Hour Cancellation Window: Full refund available if cancelled within 24 hours of booking.",
      "No Cancellations After 24 Hours: Due to custom nature of large idols, no cancellations or refunds after 24 hours from booking.",
      "Custom orders begin production immediately after 24-hour window - please ensure your requirements before confirming."
    ]
  },
  {
    title: "Terms & Conditions",
    icon: <AssignmentIcon />,
    color: "#5e7a3c",
    bgColor: "#f5fff5",
    points: [
      "Welcome to Mitti Arts! (Telangana Shilpa Kala) These terms outline rules for using our website and services.",
      "\"We\", \"us\", and \"our\" refer to Mitti Arts and its affiliates.",
      "\"You\" and \"your\" refer to the website user.",
      "You must be at least 18 years old to use our website.",
      "You agree to use our website for lawful purposes only.",
      "🎨 PRODUCT INFORMATION",
      "We offer handmade ceramic products, Ganesh idols, and artisanal goods.",
      "Product descriptions and prices are subject to change without notice.",
      "Handcrafted items may have natural variations in size, color, and texture.",
      "Ganesh idols are custom-made using traditional techniques and pure Ganga clay.",
      "💳 PAYMENT & PRICING", 
      "Payment terms are as stated on our website.",
      "We accept various payment methods including cards and digital payments.",
      "Prices include all taxes unless otherwise specified.",
      "Custom Ganesh idol orders may require advance payment as specified.",
      "🚚 DELIVERY TERMS",
      "Shipping and delivery terms are detailed in our Shipping Policy.",
      "We strive to deliver products promptly and efficiently.",
      "Special handling applies to fragile and large items.",
      "📋 LEGAL & LIABILITY",
      "Our website and content are protected by intellectual property laws.",
      "Products are provided on \"as is\" and \"as available\" basis.",
      "We shall not be liable for damages beyond the scope of applicable law.",
      "Terms governed by Indian law.",
      "We reserve the right to modify terms at any time.",
      "Contact us for any questions or concerns."
    ]
  },
  {
    title: "Refund & Return",
    icon: <RefreshIcon />,
    color: "#7a623c",
    bgColor: "#fffaf0",
    points: [
      "💰 GENERAL REFUND POLICY",
      "Refunds available for incorrect, missing, or poor-quality items.",
      "Refund requests must be made within 24 hours of receiving the order.",
      "Returns not accepted due to the handcrafted nature of products.",
      "No refunds for customer errors or external delivery delays.",
      "🕉️ GANESH IDOL SPECIFIC POLICY",
      "24-Hour Cancellation Window: Full refund if cancelled within 24 hours of booking.",
      "No Cancellations After 24 Hours: Custom idols cannot be cancelled or refunded after 24 hours due to immediate production start.",
      "Damage During Delivery: Report immediately with photos for assessment and resolution.",
      "Size Variations: Natural 1-2 inch variations are not grounds for refund as disclosed in terms.",
      "Hairline Cracks: Minimal natural clay cracks are characteristic of authentic Ganga clay products.",
      "📞 REFUND PROCESS",
      "To request refund: Provide order number, issue description, and photos.",
      "Approved refunds credited within 7–10 days to original payment method.",
      "Partial refunds may apply for damaged items that are still usable.",
      "Custom orders have specific terms as outlined in Ganesh Idol Terms section."
    ]
  },
  {
    title: "Privacy Policy",
    icon: <SecurityIcon />,
    color: "#3c5a7a",
    bgColor: "#f5faff",
    points: [
      "At Mitti Arts, we value your privacy and protect your personal data. This policy outlines our data practices.",
      "📊 DATA WE COLLECT",
      "Personal data: name, email address, phone number, and shipping address.",
      "Payment information: credit/debit card details, billing address.",
      "Usage data: browsing history, IP address, device information.",
      "Custom order preferences: Ganesh idol specifications, customization requests.",
      "🎯 HOW WE USE YOUR DATA",
      "To process and fulfill orders including custom Ganesh idols.",
      "To communicate about orders, delivery updates, and promotions.",
      "To improve our website and services.",
      "To coordinate special delivery requirements for large items.",
      "🔒 DATA SECURITY",
      "We implement robust security measures to protect your data.",
      "We comply with applicable data protection laws and regulations.",
      "Payment processing through secure, encrypted channels.",
      "🤝 DATA SHARING",
      "We may share information with:",
      "Payment processors and banks for transaction processing.",
      "Shipping and delivery providers for order fulfillment.",
      "Artisan partners for custom order specifications.",
      "Law enforcement agencies (if required by law).",
      "✋ YOUR RIGHTS",
      "You have the right to:",
      "Access and update your personal data.",
      "Request data deletion or correction.",
      "Opt-out of marketing communications.",
      "🍪 COOKIES & TRACKING",
      "We use cookies to enhance your browsing experience.",
      "You can manage cookie settings through your browser.",
      "📝 POLICY UPDATES",
      "We reserve the right to modify this privacy policy at any time.",
      "Significant changes will be communicated via email or website notice."
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

// Custom list item component with animation and special formatting
const AnimatedListItem = ({ text, index, isHeader = false }) => {
  const isMainHeader = text.includes('🕉️') || text.includes('🙏') || text.includes('📦') || text.includes('💰') || text.includes('🎨') || text.includes('💳') || text.includes('🚚') || text.includes('📋') || text.includes('📊') || text.includes('🎯') || text.includes('🔒') || text.includes('🤝') || text.includes('✋') || text.includes('🍪') || text.includes('📝') || text.includes('📞');
  
  return (
    <ListItem 
      sx={{
        py: isMainHeader ? 2 : 1.2,
        animation: `${fadeIn} 0.5s ease ${index * 0.1}s both`,
        opacity: 0,
        backgroundColor: isMainHeader ? 'rgba(255, 107, 53, 0.05)' : 'transparent',
        borderRadius: isMainHeader ? 2 : 0,
        mb: isMainHeader ? 1 : 0,
        border: isMainHeader ? '1px solid rgba(255, 107, 53, 0.1)' : 'none',
      }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>
        <CircleIcon sx={{ 
          fontSize: isMainHeader ? 14 : 10, 
          color: isMainHeader ? "#FF6B35" : "primary.main",
          animation: `${pulse} 3s infinite ${index * 0.2}s`,
        }} />
      </ListItemIcon>
      <ListItemText 
        primary={text}
        primaryTypographyProps={{
          fontSize: isMainHeader ? "1.1rem" : "1rem",
          color: isMainHeader ? "#FF6B35" : "#444",
          lineHeight: 1.6,
          fontWeight: isMainHeader ? 600 : 400,
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
            Everything you need to know about our business practices, custom Ganesh idols, and customer agreements
          </Typography>
        </Box>

        {/* Special Alert for Ganesh Customers */}
        <Alert 
          severity="info" 
          sx={{ 
            mb: 4, 
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid rgba(255, 107, 53, 0.2)',
            borderRadius: 3,
            '& .MuiAlert-icon': {
              color: '#FF6B35'
            }
          }}
        >
          <AlertTitle sx={{ color: '#FF6B35', fontWeight: 600 }}>
            🕉️ Important for Ganesh Idol Customers
          </AlertTitle>
          <Typography sx={{ color: '#5c3a1e' }}>
            Please review the <strong>"Ganesh Idol Terms"</strong> tab for specific information about our handcrafted idols, 
            including handling instructions, size variations, and cancellation policies.
          </Typography>
        </Alert>

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
                      fontSize: { xs: "0.8rem", md: "0.95rem" },
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
                  Last updated: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </Box>
              
              <List sx={{ pt: 0 }}>
                {section.points.map((point, idx) => (
                  <AnimatedListItem 
                    key={idx} 
                    text={point} 
                    index={idx}
                    isHeader={point.includes('🕉️') || point.includes('🙏') || point.includes('📦') || point.includes('💰') || point.includes('🎨') || point.includes('💳') || point.includes('🚚') || point.includes('📋') || point.includes('📊') || point.includes('🎯') || point.includes('🔒') || point.includes('🤝') || point.includes('✋') || point.includes('🍪') || point.includes('📝') || point.includes('📞')}
                  />
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
          <Typography sx={{ color: "#7a4b2c", mb: 2 }}>
            Especially for Ganesh idol customization, delivery coordination, and special requirements.
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
          © {new Date().getFullYear()} Mitti Arts (Telangana Shilpa Kala). All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Policies;