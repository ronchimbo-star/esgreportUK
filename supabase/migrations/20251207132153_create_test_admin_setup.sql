/*
  # Create Test Admin Organization and Setup
  
  1. Purpose
    - Create test organization for admin users
    - Set up initial data for testing
    - Prepare admin user structure
    
  2. Test Organization
    - Name: ESGreport Admin
    - Industry: Technology
    - Subscription: Enterprise tier
    
  3. Notes
    - Admin users must sign up through the normal signup flow first
    - After signup, their role can be updated to admin/super_admin
    - This migration creates the organization structure
*/

-- Create test admin organization
INSERT INTO organizations (
  id,
  name,
  slug,
  industry,
  size,
  description,
  subscription_tier,
  subscription_status,
  max_users,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ESGreport Admin Organization',
  'esgreport-admin',
  'Technology',
  'Large',
  'Test organization for platform administrators',
  'enterprise',
  'active',
  999,
  now()
) ON CONFLICT (id) DO NOTHING;

-- Create a helper function to update user role (for manual use)
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    role = 'admin',
    organization_id = '00000000-0000-0000-0000-000000000001'
  WHERE email = user_email;
  
  RAISE NOTICE 'User % updated to admin role', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a helper function to make super admin
CREATE OR REPLACE FUNCTION make_user_super_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    role = 'super_admin',
    organization_id = '00000000-0000-0000-0000-000000000001'
  WHERE email = user_email;
  
  RAISE NOTICE 'User % updated to super_admin role', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add some sample news posts for testing
INSERT INTO news_posts (
  title,
  slug,
  excerpt,
  content,
  category,
  is_published,
  published_at,
  author_name,
  tags
) VALUES
(
  'New EU CSRD Regulations: What You Need to Know',
  'new-eu-csrd-regulations-what-you-need-to-know',
  'The Corporate Sustainability Reporting Directive (CSRD) represents a major shift in ESG reporting requirements for companies operating in the EU.',
  E'The Corporate Sustainability Reporting Directive (CSRD) represents a major shift in ESG reporting requirements for companies operating in the EU. This comprehensive guide covers everything you need to know.\n\n**Key Changes:**\n\nThe CSRD significantly expands the scope of sustainability reporting requirements:\n\n1. **Expanded Scope**: The directive now applies to all large companies and listed SMEs, affecting approximately 50,000 companies (up from 11,000 under the previous directive).\n\n2. **Double Materiality**: Companies must report on both:\n   - How sustainability issues affect their business (financial materiality)\n   - How their operations impact society and the environment (impact materiality)\n\n3. **European Sustainability Reporting Standards (ESRS)**: New standardized reporting requirements covering:\n   - Environmental matters (climate change, pollution, biodiversity)\n   - Social matters (workforce, communities, consumers)\n   - Governance matters (business conduct, management)\n\n**Timeline:**\n\n- 2024: Large public-interest entities with >500 employees\n- 2025: Other large companies\n- 2026: Listed SMEs\n\n**What You Should Do:**\n\n1. Assess your reporting obligations\n2. Conduct a double materiality assessment\n3. Review and enhance data collection processes\n4. Engage stakeholders for input\n5. Consider getting external assurance\n\n**Getting Started:**\n\nStart by understanding which ESRS standards apply to your organization. Our platform can help you map your current reporting to CSRD requirements and identify gaps.',
  'Regulations',
  true,
  now(),
  'ESGreport Team',
  ARRAY['CSRD', 'EU Regulations', 'Compliance']
),
(
  'Understanding Scope 3 Emissions: A Complete Guide',
  'understanding-scope-3-emissions-complete-guide',
  'Scope 3 emissions often represent the largest portion of a company''s carbon footprint. Learn how to measure and reduce them effectively.',
  E'Scope 3 emissions often represent the largest portion of a company''s carbon footprint, typically accounting for 70-90% of total emissions. Here''s everything you need to know.\n\n**What Are Scope 3 Emissions?**\n\nScope 3 emissions are indirect greenhouse gas emissions that occur in a company''s value chain, both upstream and downstream.\n\n**The 15 Categories:**\n\n**Upstream:**\n1. Purchased goods and services\n2. Capital goods\n3. Fuel and energy-related activities\n4. Upstream transportation and distribution\n5. Waste generated in operations\n6. Business travel\n7. Employee commuting\n8. Upstream leased assets\n\n**Downstream:**\n9. Downstream transportation and distribution\n10. Processing of sold products\n11. Use of sold products\n12. End-of-life treatment of sold products\n13. Downstream leased assets\n14. Franchises\n15. Investments\n\n**Why They Matter:**\n\n- Investors increasingly require comprehensive emissions reporting\n- Supply chain transparency is essential for climate strategy\n- Many companies find their biggest reduction opportunities in Scope 3\n- Regulatory requirements (CSRD, SEC Climate Rule) include Scope 3\n\n**How to Get Started:**\n\n1. **Screen for Materiality**: Identify which categories are most significant\n2. **Collect Data**: Start with available data, improve quality over time\n3. **Calculate**: Use emission factors or supplier-specific data\n4. **Set Targets**: Focus on material categories first\n5. **Engage Suppliers**: Work with key suppliers to reduce emissions\n\n**Common Challenges:**\n\n- Data availability and quality\n- Supplier engagement\n- Calculation methodology complexity\n- Resource requirements\n\n**Best Practices:**\n\n- Start with high-impact categories\n- Use industry-average emission factors initially\n- Engage suppliers for primary data\n- Set realistic timelines (3-5 years for comprehensive inventory)\n- Integrate into procurement decisions\n\nOur platform provides tools to help you track, analyze, and report Scope 3 emissions across all 15 categories.',
  'Climate Action',
  true,
  now() - interval '2 days',
  'ESGreport Team',
  ARRAY['Scope 3', 'Carbon Emissions', 'Climate']
),
(
  'GRI vs SASB vs TCFD: Which Framework Should You Choose?',
  'gri-vs-sasb-vs-tcfd-which-framework-should-you-choose',
  'Navigate the complex landscape of ESG reporting frameworks. We compare the three most widely adopted standards to help you make an informed choice.',
  E'Choosing the right ESG reporting framework can be challenging. Here''s a comprehensive comparison of the three most widely adopted standards.\n\n**GRI (Global Reporting Initiative)**\n\n**Best For:** Companies seeking comprehensive sustainability reporting for diverse stakeholders\n\n**Key Features:**\n- Universal standards applicable to all organizations\n- Topic-specific standards for detailed disclosure\n- Emphasis on stakeholder inclusiveness\n- Widely recognized globally (over 10,000 reporters)\n\n**Pros:**\n- Comprehensive coverage of ESG topics\n- Flexible and adaptable\n- Strong focus on impact on society/environment\n- Free to use\n\n**Cons:**\n- Can be resource-intensive\n- Less focus on financial materiality\n- Requires significant stakeholder engagement\n\n---\n\n**SASB (Sustainability Accounting Standards Board)**\n\n**Best For:** Companies focused on investor communication and financial materiality\n\n**Key Features:**\n- 77 industry-specific standards\n- Focus on financially material ESG issues\n- Designed for SEC filings and investor reports\n- Quantitative metrics with activity metrics\n\n**Pros:**\n- Industry-specific and focused\n- Investor-oriented\n- Cost-effective (focuses on material issues only)\n- Comparable within industries\n\n**Cons:**\n- Limited to financially material topics\n- Less comprehensive than GRI\n- Not suitable for all stakeholder types\n- Industry must be selected carefully\n\n---\n\n**TCFD (Task Force on Climate-related Financial Disclosures)**\n\n**Best For:** Companies needing to disclose climate-related financial risks\n\n**Key Features:**\n- Four pillars: Governance, Strategy, Risk Management, Metrics & Targets\n- Scenario analysis requirement\n- Focus on climate risks and opportunities\n- Increasingly mandatory in many jurisdictions\n\n**Pros:**\n- Climate-focused and specific\n- Strong regulatory support\n- Forward-looking (scenario analysis)\n- Integrated with financial reporting\n\n**Cons:**\n- Climate-only (doesn''t cover social/governance)\n- Scenario analysis can be complex\n- Requires sophisticated climate risk assessment\n- Resource-intensive\n\n---\n\n**Can You Use Multiple Frameworks?**\n\nYes! Many companies use:\n- **GRI + TCFD**: Comprehensive ESG plus climate focus\n- **SASB + TCFD**: Investor focus plus climate disclosure\n- **All three**: Maximum stakeholder coverage\n\n**Our Recommendation:**\n\n- **Start-ups/SMEs**: SASB (focused and manageable)\n- **Large corporations**: GRI + TCFD (comprehensive)\n- **Investor-focused**: SASB + TCFD\n- **Climate-intensive industries**: TCFD (mandatory in many cases)\n\nOur platform supports all three frameworks plus 12 others, making it easy to report across multiple standards simultaneously.',
  'Frameworks',
  true,
  now() - interval '5 days',
  'ESGreport Team',
  ARRAY['GRI', 'SASB', 'TCFD', 'Framework Comparison']
);

-- Log setup completion
DO $$
BEGIN
  RAISE NOTICE 'Test admin organization created successfully';
  RAISE NOTICE 'Organization ID: 00000000-0000-0000-0000-000000000001';
  RAISE NOTICE 'Sample news posts added for testing';
  RAISE NOTICE '';
  RAISE NOTICE '=== ADMIN USER SETUP INSTRUCTIONS ===';
  RAISE NOTICE '1. Sign up at /signup with your email';
  RAISE NOTICE '2. After signup, run: SELECT make_user_admin(''your-email@example.com'');';
  RAISE NOTICE '3. For super admin: SELECT make_user_super_admin(''your-email@example.com'');';
  RAISE NOTICE '4. Refresh the page and navigate to /admin';
  RAISE NOTICE '';
END $$;
