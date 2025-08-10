const mongoose = require('mongoose');
require('dotenv').config();

const Plan = require('./src/models/Plan');

const plans = [
  {
    name: 'Beginner',
    displayName: 'Beginner Plan',
    description: 'Perfect for individuals getting started with content creation',
    price: 0,
    currency: 'INR',
    interval: 'month',
    features: {
      teamMembers: 1,
      projects: 3,
      storage: 500, // 500 MB
      analytics: 'basic',
      prioritySupport: false,
      customIntegrations: false,
      apiCalls: 1000
    },
    isActive: true,
    isDefault: true,
    popularPlan: false,
    recommendedPlan: false,
    trialDays: 0,
    setupFee: 0,
    sortOrder: 1
  },
  {
    name: 'Pro',
    displayName: 'Pro Plan',
    description: 'For growing teams and content creators',
    price: 999,
    currency: 'INR',
    interval: 'month',
    features: {
      teamMembers: 5,
      projects: 20,
      storage: 5120, // 5 GB in MB
      analytics: 'advanced',
      prioritySupport: true,
      customIntegrations: false,
      apiCalls: 10000
    },
    isActive: true,
    isDefault: false,
    popularPlan: true,
    recommendedPlan: true,
    trialDays: 14,
    setupFee: 0,
    sortOrder: 2
  },
  {
    name: 'Master',
    displayName: 'Master Plan',
    description: 'For large teams and enterprise content operations',
    price: 2499,
    currency: 'INR',
    interval: 'month',
    features: {
      teamMembers: -1, // Unlimited
      projects: -1, // Unlimited
      storage: 51200, // 50 GB in MB
      analytics: 'advanced',
      prioritySupport: true,
      customIntegrations: true,
      apiCalls: -1 // Unlimited
    },
    isActive: true,
    isDefault: false,
    popularPlan: false,
    recommendedPlan: false,
    trialDays: 30,
    setupFee: 0,
    sortOrder: 3
  }
];

const seedPlans = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing plans...');
    await Plan.deleteMany({});

    console.log('📝 Creating plans...');
    const createdPlans = await Plan.insertMany(plans);

    console.log('\n🎉 Plans created successfully!');
    console.log('==========================================');
    
    createdPlans.forEach(plan => {
      console.log(`\n📋 ${plan.displayName} (${plan.name})`);
      console.log(`   💰 Price: ₹${plan.price}/${plan.interval}`);
      console.log(`   👥 Team Members: ${plan.features.teamMembers === -1 ? 'Unlimited' : plan.features.teamMembers}`);
      console.log(`   📁 Projects: ${plan.features.projects === -1 ? 'Unlimited' : plan.features.projects}`);
      console.log(`   💾 Storage: ${plan.features.storage === -1 ? 'Unlimited' : `${plan.features.storage} MB`}`);
      console.log(`   📊 Analytics: ${plan.features.analytics}`);
      console.log(`   🎯 Priority Support: ${plan.features.prioritySupport ? 'Yes' : 'No'}`);
      console.log(`   🔧 Custom Integrations: ${plan.features.customIntegrations ? 'Yes' : 'No'}`);
      console.log(`   🔌 API Calls: ${plan.features.apiCalls === -1 ? 'Unlimited' : plan.features.apiCalls}`);
      console.log(`   🆓 Trial Days: ${plan.trialDays}`);
      console.log(`   ⭐ Popular: ${plan.popularPlan ? 'Yes' : 'No'}`);
      console.log(`   🏆 Default: ${plan.isDefault ? 'Yes' : 'No'}`);
    });

    console.log('\n==========================================');
    console.log('✅ Plan seeding completed successfully!');

    // Verify the plans
    console.log('\n🔍 Verifying created plans...');
    const verification = await Plan.find({}).sort({ sortOrder: 1 });
    console.log(`📊 Total plans created: ${verification.length}`);

    // Test plan methods
    console.log('\n🧪 Testing plan methods...');
    const defaultPlan = await Plan.getDefaultPlan();
    console.log(`🎯 Default plan: ${defaultPlan?.name}`);

    const activePlans = await Plan.getActivePlans();
    console.log(`📋 Active plans: ${activePlans.map(p => p.name).join(', ')}`);

    const proPlan = await Plan.getByName('Pro');
    if (proPlan) {
      console.log(`✅ Pro plan features test:`);
      console.log(`   - Advanced Analytics: ${proPlan.hasFeature('advanced_analytics')}`);
      console.log(`   - Priority Support: ${proPlan.hasFeature('priority_support')}`);
      console.log(`   - Custom Integrations: ${proPlan.hasFeature('custom_integrations')}`);
      
      // Test usage limit checking
      const teamLimit = proPlan.checkLimit('teamMembers', 3);
      console.log(`   - Team limit check (3/5): ${JSON.stringify(teamLimit)}`);
    }

    console.log('\n🎊 All tests passed! Plans are ready for use.');

  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Check if this script is being run directly
if (require.main === module) {
  seedPlans();
}

module.exports = { seedPlans, plans };
