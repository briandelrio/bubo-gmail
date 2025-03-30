import React, { useState } from 'react';

// Main App Component
const BuboPrototype = () => {
  // State management for the user flow
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [purpose, setPurpose] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  
  // Company data
  const companies = [
    { id: 1, name: 'FitLife Berlin', industry: 'Fitness Studios', employees: '250-500', selected: false },
    { id: 2, name: 'GymTech GmbH', industry: 'Equipment Retailer', employees: '50-200', selected: false },
    { id: 3, name: 'SportHaus', industry: 'Sporting Goods', employees: '100-250', selected: false },
  ];
  
  // Contact data
  const contacts = [
    { id: 1, name: 'Sarah Müller', role: 'Head of Purchasing', email: 's.mueller@fitlife-berlin.de', company: 'FitLife Berlin', match: 95, selected: false },
    { id: 2, name: 'Thomas Weber', role: 'Operations Director', email: 't.weber@fitlife-berlin.de', company: 'FitLife Berlin', match: 80, selected: false },
    { id: 3, name: 'Jan Becker', role: 'CEO', email: 'j.becker@gymtech.de', company: 'GymTech GmbH', match: 90, selected: false },
  ];
  
  // Toggle company selection
  const toggleCompanySelection = (id) => {
    const updatedCompanies = [...companies];
    const index = updatedCompanies.findIndex(company => company.id === id);
    updatedCompanies[index].selected = !updatedCompanies[index].selected;
    setSelectedCompanies(updatedCompanies.filter(company => company.selected));
  };
  
  // Toggle contact selection
  const toggleContactSelection = (id) => {
    const updatedContacts = [...contacts];
    const index = updatedContacts.findIndex(contact => contact.id === id);
    updatedContacts[index].selected = !updatedContacts[index].selected;
    setSelectedContacts(updatedContacts.filter(contact => contact.selected));
  };
  
  // Navigate to next screen
  const goToScreen = (screen) => {
    setCurrentScreen(screen);
  };
  
  // Render appropriate screen based on state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-md w-full">
        {/* Screen title for debugging */}
        <div className="text-xs text-gray-400 text-center mb-2">
          Current Screen: {currentScreen}
        </div>
        
        {/* Module container */}
        <div className="rounded-xl shadow-md overflow-hidden bg-[#F9F8F7]">
          {/* Header */}
          <div className="p-4 flex justify-between items-center border-b border-[#E8E7E6]">
            <div className="flex items-center">
              <span className="text-lg font-semibold text-[#5C5C5B]">Bubo</span>
              <span className="ml-2 text-sm text-[#A4A3A2]">Smart Outreach</span>
            </div>
            <button 
              className="text-[#A4A3A2] text-xl"
              onClick={() => goToScreen('dashboard')}
            >
              ×
            </button>
          </div>
          
          {/* Screen content */}
          {currentScreen === 'dashboard' && (
            <Dashboard goToScreen={goToScreen} />
          )}
          
          {currentScreen === 'onboarding' && (
            <Onboarding goToScreen={goToScreen} />
          )}
          
          {currentScreen === 'purpose' && (
            <PurposeDefinition 
              purpose={purpose} 
              setPurpose={setPurpose} 
              goToScreen={goToScreen} 
            />
          )}
          
          {currentScreen === 'companies' && (
            <CompanySelection 
              companies={companies} 
              toggleSelection={toggleCompanySelection} 
              goToScreen={goToScreen} 
            />
          )}
          
          {currentScreen === 'contacts' && (
            <ContactDiscovery 
              contacts={contacts} 
              toggleSelection={toggleContactSelection} 
              goToScreen={goToScreen} 
            />
          )}
          
          {currentScreen === 'emails' && (
            <EmailCreation 
              contacts={contacts.filter(c => c.selected)} 
              goToScreen={goToScreen} 
            />
          )}
          
          {currentScreen === 'followups' && (
            <FollowupSetup goToScreen={goToScreen} />
          )}
          
          {currentScreen === 'send' && (
            <SendAndSchedule goToScreen={goToScreen} />
          )}
          
          {currentScreen === 'complete' && (
            <CampaignComplete goToScreen={goToScreen} />
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard component
const Dashboard = ({ goToScreen }) => {
  return (
    <div className="p-4">
      <h2 className="text-base font-semibold text-[#5C5C5B] mb-3">Dashboard</h2>
      
      {/* Metrics */}
      <div className="flex space-x-2 mb-4">
        <div className="flex-1 bg-white p-3 rounded-lg border border-[#E8E7E6] flex flex-col items-center">
          <span className="text-xl font-semibold text-[#5C5C5B]">0</span>
          <span className="text-xs text-[#838382]">Active Campaigns</span>
        </div>
        <div className="flex-1 bg-white p-3 rounded-lg border border-[#E8E7E6] flex flex-col items-center">
          <span className="text-xl font-semibold text-[#5C5C5B]">-</span>
          <span className="text-xs text-[#838382]">Open Rate</span>
        </div>
        <div className="flex-1 bg-white p-3 rounded-lg border border-[#E8E7E6] flex flex-col items-center">
          <span className="text-xl font-semibold text-[#5C5C5B]">-</span>
          <span className="text-xs text-[#838382]">Reply Rate</span>
        </div>
      </div>
      
      {/* Action buttons */}
      <button 
        className="w-full p-3 rounded-md bg-white border border-[#5C5C5B] text-[#5C5C5B] mb-3 hover:bg-gray-50"
        onClick={() => goToScreen('purpose')}
      >
        Start New Campaign
      </button>
      
      <button className="w-full p-3 rounded-md bg-white border border-[#E8E7E6] text-[#5C5C5B] mb-3 hover:bg-gray-50">
        View All Campaigns
      </button>
      
      {/* Empty state for first-time users */}
      <div className="mt-6 bg-white p-4 rounded-lg border border-[#E8E7E6] text-center">
        <p className="text-[#838382] text-sm">No recent activity yet. Start your first campaign!</p>
      </div>
    </div>
  );
};

// Onboarding component
const Onboarding = ({ goToScreen }) => {
  return (
    <div className="p-4">
      <h2 className="text-base font-semibold text-center text-[#5C5C5B] mb-4">Welcome to Bubo</h2>
      <p className="text-center text-sm text-[#838382] mb-4">Let's set up your account in 2 simple steps</p>
      
      {/* Hunter.io connection */}
      <div className="bg-white rounded-lg border border-[#E8E7E6] p-4 mb-4 flex items-center">
        <div className="w-8 h-8 rounded-full bg-[#F6F0FF] flex items-center justify-center mr-4">
          <span className="text-[#8E5ADF] font-semibold">1</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[#5C5C5B]">Connect to Hunter.io</p>
          <p className="text-xs text-[#838382]">To find the right contacts for your outreach</p>
        </div>
        <button className="px-3 py-1.5 rounded-md border border-[#8E5ADF] text-[#8E5ADF] text-sm">
          Connect
        </button>
      </div>
      
      {/* Gmail connection */}
      <div className="bg-white rounded-lg border border-[#E8E7E6] p-4 mb-6 flex items-center">
        <div className="w-8 h-8 rounded-full bg-[#EAEAEA] flex items-center justify-center mr-4">
          <span className="text-[#A4A3A2] font-semibold">2</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[#5C5C5B]">Connect Gmail</p>
          <p className="text-xs text-[#838382]">To send emails and track responses</p>
        </div>
        <button className="px-3 py-1.5 rounded-md border border-[#E8E7E6] text-[#A4A3A2] text-sm">
          Connect
        </button>
      </div>
      
      {/* Skip option */}
      <div className="text-center">
        <button 
          className="text-[#8E5ADF] text-sm"
          onClick={() => goToScreen('purpose')}
        >
          Skip setup and explore Bubo
        </button>
      </div>
    </div>
  );
};

// Purpose Definition component
const PurposeDefinition = ({ purpose, setPurpose, goToScreen }) => {
  return (
    <div className="p-4">
      <h2 className="text-base font-semibold text-[#5C5C5B] mb-3">Define your outreach purpose</h2>
      
      {/* Purpose input */}
      <textarea
        className="w-full h-32 p-3 rounded-lg border border-[#E8E7E6] bg-white text-sm text-[#5C5C5B] focus:outline-none focus:ring-1 focus:ring-[#8E5ADF] mb-6"
        placeholder="I'm looking to sell to German companies in Berlin gym equipment..."
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
      ></textarea>
      
      {/* Segment options */}
      <h2 className="text-base font-semibold text-[#5C5C5B] mb-3">Segment by (optional)</h2>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <button className="px-4 py-1.5 rounded-full border border-[#E8E7E6] bg-white text-[#838382] text-sm flex items-center">
          <span className="w-2 h-2 rounded-full bg-[#838382] mr-2"></span>
          Size
        </button>
        <button className="px-4 py-1.5 rounded-full border border-[#E8E7E6] bg-white text-[#838382] text-sm flex items-center">
          <span className="w-2 h-2 rounded-full bg-[#838382] mr-2"></span>
          Employees
        </button>
        <button className="px-4 py-1.5 rounded-full border border-[#E8E7E6] bg-white text-[#838382] text-sm flex items-center">
          <span className="w-2 h-2 rounded-full bg-[#838382] mr-2"></span>
          Location
        </button>
        <button className="px-4 py-1.5 rounded-full border border-[#E8E7E6] bg-white text-[#838382] text-sm flex items-center">
          <span className="w-2 h-2 rounded-full bg-[#838382] mr-2"></span>
          Industry
        </button>
      </div>
      
      {/* Action button */}
      <button 
        className="w-full p-3 rounded-md bg-white border border-[#5C5C5B] text-[#5C5C5B] hover:bg-gray-50"
        onClick={() => goToScreen('companies')}
        disabled={!purpose.trim()}
      >
        Find Companies
      </button>
    </div>
  );
};

// Company Selection component
const CompanySelection = ({ companies, toggleSelection, goToScreen }) => {
  return (
    <div className="p-4">
      {/* Search bar */}
      <div className="relative mb-4">
        <input
          type="text"
          className="w-full p-2 pl-8 rounded-full border border-[#E8E7E6] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#8E5ADF]"
          placeholder="Search companies..."
        />
        <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-[#A4A3A2]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      
      {/* View tabs */}
      <div className="flex space-x-2 mb-4">
        <button className="px-3 py-1 rounded-full bg-[#ECE9F3] border border-[#8E5ADF] text-[#8E5ADF] text-xs">Auto</button>
        <button className="px-3 py-1 rounded-full bg-white border border-[#E8E7E6] text-[#838382] text-xs">Manual</button>
        <button className="px-3 py-1 rounded-full bg-white border border-[#E8E7E6] text-[#838382] text-xs">Import</button>
        <button className="px-3 py-1 rounded-full bg-white border border-[#E8E7E6] text-[#838382] text-xs">Saved</button>
      </div>
      
      {/* Results header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-[#5C5C5B]">Recommended Companies (3)</h2>
        <div className="text-xs text-[#8E5ADF] space-x-3">
          <button>Filter</button>
          <button>Sort</button>
        </div>
      </div>
      
      {/* Company cards */}
      <div className="space-y-3 mb-4">
        {companies.map(company => (
          <div 
            key={company.id} 
            className="bg-white rounded-lg border border-[#E8E7E6] p-3 flex items-center"
          >
            <input
              type="checkbox"
              className="mr-3 h-4 w-4 text-[#8E5ADF] rounded border-[#E8E7E6]"
              checked={company.selected}
              onChange={() => toggleSelection(company.id)}
            />
            <div className="flex-1">
              <p className="font-semibold text-[#5C5C5B]">{company.name}</p>
              <p className="text-xs text-[#838382]">{company.industry} • {company.employees} employees</p>
            </div>
            <button className="w-6 h-6 rounded-full border border-[#8E5ADF] flex items-center justify-center text-[#8E5ADF]">
              +
            </button>
          </div>
        ))}
      </div>
      
      {/* Load more */}
      <div className="text-center mb-4">
        <button className="text-[#8E5ADF] text-sm">Show more companies (7 more)</button>
      </div>
      
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <button className="p-2.5 rounded-md bg-white border border-[#E8E7E6] text-[#5C5C5B] text-sm">
          Save List
        </button>
        <button 
          className="p-2.5 rounded-md bg-white border border-[#5C5C5B] text-[#5C5C5B] text-sm"
          onClick={() => goToScreen('contacts')}
        >
          Find Contacts
        </button>
      </div>
      
      {/* Selection status */}
      <div className="flex justify-between text-xs">
        <span className="text-[#838382]">3 companies selected</span>
        <button className="text-[#8E5ADF]">Select all (10)</button>
      </div>
    </div>
  );
};

// Contact Discovery component
const ContactDiscovery = ({ contacts, toggleSelection, goToScreen }) => {
  return (
    <div className="p-4">
      {/* Company navigation */}
      <div className="mb-3">
        <h2 className="text-base font-semibold text-[#5C5C5B]">FitLife Berlin</h2>
        <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs bg-white border border-[#E8E7E6] text-[#838382]">
          1 of 3
        </div>
      </div>
      
      {/* Contact filters */}
      <h3 className="text-sm font-semibold text-[#5C5C5B] mb-2">Recommended Contacts</h3>
      
      <div className="flex space-x-2 mb-4">
        <button className="px-3 py-1 rounded-full bg-[#ECE9F3] border border-[#8E5ADF] text-[#8E5ADF] text-xs">All Roles</button>
        <button className="px-3 py-1 rounded-full bg-white border border-[#E8E7E6] text-[#838382] text-xs">Executives</button>
        <button className="px-3 py-1 rounded-full bg-white border border-[#E8E7E6] text-[#838382] text-xs">Purchasing</button>
      </div>
      
      {/* Contact cards */}
      <div className="space-y-3 mb-4">
        {contacts.filter(c => c.company === 'FitLife Berlin').map(contact => (
          <div 
            key={contact.id} 
            className="bg-white rounded-lg border border-[#E8E7E6] p-3"
          >
            <div className="flex items-center mb-1">
              <input
                type="checkbox"
                className="mr-3 h-4 w-4 text-[#8E5ADF] rounded border-[#E8E7E6]"
                checked={contact.selected}
                onChange={() => toggleSelection(contact.id)}
              />
              <div className="flex-1">
                <p className="font-semibold text-[#5C5C5B]">{contact.name}</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#F6F0FF] flex items-center justify-center text-[#8E5ADF] text-xs">
                ✓
              </div>
            </div>
            <div className="pl-7">
              <p className="text-xs text-[#838382] mb-1">{contact.role}</p>
              <p className="text-xs text-[#8E5ADF]">{contact.email}</p>
              
              <div className="flex justify-end mt-1">
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs bg-[#F6F0FF] text-[#8E5ADF]">
                  {contact.match}% match
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add manually */}
      <button className="w-full p-2.5 rounded-md bg-white border border-[#E8E7E6] text-[#5C5C5B] text-sm mb-4">
        + Add Contact Manually
      </button>
      
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          className="p-2.5 rounded-md bg-white border border-[#E8E7E6] text-[#5C5C5B] text-sm"
          onClick={() => goToScreen('companies')}
        >
          Back
        </button>
        <button 
          className="p-2.5 rounded-md bg-white border border-[#5C5C5B] text-[#5C5C5B] text-sm"
          onClick={() => goToScreen('emails')}
        >
          Create Emails
        </button>
      </div>
    </div>
  );
};

// Email Creation component
const EmailCreation = ({ contacts, goToScreen }) => {
  return (
    <div className="p-4">
      {/* Email navigation */}
      <div className="mb-3">
        <h2 className="text-base font-semibold text-[#5C5C5B]">Email to Sarah Müller</h2>
        <div className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs bg-white border border-[#E8E7E6] text-[#838382]">
          1 of 2
        </div>
      </div>
      
      {/* Email preview */}
      <div className="bg-white rounded-lg border border-[#E8E7E6] p-4 mb-4">
        <p className="font-semibold text-sm text-[#5C5C5B] mb-3">Subject: Premium Gym Equipment for FitLife Berlin</p>
        
        <p className="text-sm text-[#5C5C5B] mb-2">Dear Sarah,</p>
        
        <p className="text-sm text-[#5C5C5B] mb-2">
          I noticed that FitLife Berlin has been expanding its premium fitness studios across the city, and I wanted to introduce our latest line of commercial-grade gym equipment.
        </p>
        
        <p className="text-sm text-[#5C5C5B] mb-2">
          Would you be open to a brief conversation about how our equipment could enhance your members' experience?
        </p>
        
        <p className="text-sm text-[#5C5C5B] mb-1">Best regards,</p>
        <p className="text-sm text-[#5C5C5B]">[Your Name]</p>
      </div>
      
      {/* Tone selector */}
      <h3 className="text-sm font-semibold text-[#5C5C5B] mb-2">Email Tone</h3>
      
      <div className="flex space-x-2 mb-4">
        <button className="px-3 py-1 rounded-full bg-[#ECE9F3] border border-[#8E5ADF] text-[#8E5ADF] text-xs">Professional</button>
        <button className="px-3 py-1 rounded-full bg-white border border-[#E8E7E6] text-[#838382] text-xs">Friendly</button>
        <button className="px-3 py-1 rounded-full bg-white border border-[#E8E7E6] text-[#838382] text-xs">Direct</button>
        <button className="px-3 py-1 rounded-full bg-white border border-[#E8E7E6] text-[#838382] text-xs">Custom</button>
      </div>
      
      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button className="p-2.5 rounded-md bg-white border border-[#E8E7E6] text-[#5C5C5B] text-sm">
          Edit
        </button>
        <button className="p-2.5 rounded-md bg-white border border-[#E8E7E6] text-[#5C5C5B] text-sm">
          Skip
        </button>
        <button className="p-2.5 rounded-md bg-white border border-[#5C5C5B] text-[#5C5C5B] text-sm">
          Accept
        </button>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between text-sm mb-4">
        <button className="text-[#A4A3A2]">← Previous</button>
        <div className="text-[#A4A3A2]">1 of 2</div>
        <button className="text-[#8E5ADF]">Next →</button>
      </div>
      
      {/* Accept all link */}
      <div className="text-center">
        <button 
          className="text-[#8E5ADF] text-sm"
          onClick={() => goToScreen('followups')}
        >
          Accept All Drafts
        </button>
      </div>
    </div>
  );
};

// Follow-up Setup component
const FollowupSetup = ({ goToScreen }) => {
  return (
    <div className="p-4">
      {/* Sequence info */}
      <h2 className="text-base font-semibold text-[#5C5C5B] mb-1">Follow-up Sequence</h2>
      <p className="text-xs text-[#838382] mb-4">For: Sarah Müller, FitLife Berlin</p>
      
      {/* Timeline */}
      <div className="relative pl-8 mb-4">
        {/* Timeline line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[#E8E7E6]"></div>
        
        {/* Initial email */}
        <div className="absolute left-0 top-4 w-8 h-8 rounded-full bg-[#8E5ADF] flex items-center justify-center z-10"></div>
        <div className="bg-white rounded-lg border border-[#E8E7E6] p-3 mb-3">
          <p className="font-semibold text-sm text-[#5C5C5B]">Initial Email</p>
          <p className="text-xs text-[#838382]">Today</p>
        </div>
        
        {/* Follow-up 1 */}
        <div className="absolute left-1 top-24 w-6 h-6 rounded-full bg-white border-2 border-[#8E5ADF] flex items-center justify-center z-10"></div>
        <div className="bg-white rounded-lg border border-[#E8E7E6] p-3 mb-3">
          <div className="flex justify-between">
            <p className="font-semibold text-sm text-[#5C5C5B]">Follow-up #1</p>
            <button className="text-xs text-[#8E5ADF]">Edit</button>
          </div>
          <p className="text-xs text-[#838382] mb-1">3 days after initial email</p>
          <div className="flex justify-end">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs bg-[#F6F0FF] text-[#8E5ADF]">
              Recommended
            </span>
          </div>
        </div>
        
        {/* Follow-up 2 */}
        <div className="absolute left-1 top-44 w-6 h-6 rounded-full bg-white border-2 border-[#8E5ADF] flex items-center justify-center z-10"></div>
        <div className="bg-white rounded-lg border border-[#E8E7E6] p-3">
          <div className="flex justify-between">
            <p className="font-semibold text-sm text-[#5C5C5B]">Follow-up #2</p>
            <button className="text-xs text-[#8E5ADF]">Edit</button>
          </div>
          <p className="text-xs text-[#838382]">7 days after initial email</p>
        </div>
      </div>
      
      {/* Add follow-up */}
      <button className="w-full p-2.5 rounded-md bg-white border border-[#E8E7E6] text-[#5C5C5B] text-sm mb-4">
        + Add Another Follow-up
      </button>
      
      {/* Global settings */}
      <h3 className="text-sm font-semibold text-[#5C5C5B] mb-2">Follow-up Settings</h3>
      
      <div className="flex items-center mb-2">
        <span className="text-xs text-[#838382] w-28">Best time to send</span>
        <div className="flex-1 p-1.5 bg-white border border-[#E8E7E6] rounded text-xs text-[#5C5C5B]">
          Tuesday-Thursday, 10:00-11:00 AM
        </div>
      </div>
      
      <div className="flex items-center mb-4">
        <span className="text-xs text-[#838382] w-28">Stop if recipient</span>
        <div className="flex-1 p-1.5 bg-white border border-[#E8E7E6] rounded text-xs text-[#5C5C5B]">
          Replies or Books Meeting
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          className="p-2.5 rounded-md bg-white border border-[#E8E7E6] text-[#5C5C5B] text-sm"
          onClick={() => goToScreen('emails')}
        >
          Back
        </button>
        <button 
          className="p-2.5 rounded-md bg-white border border-[#5C5C5B] text-[#5C5C5B] text-sm"
          onClick={() => goToScreen('send')}
        >
          Schedule Campaign
        </button>
      </div>
    </div>
  );
};

// Send and Schedule component
const SendAndSchedule = ({ goToScreen }) => {
  return (
    <div className="p-4">
      {/* Campaign summary */}
      <h2 className="text-base font-semibold text-[#5C5C5B] mb-1">Campaign Summary</h2>
      <p className="text-xs text-[#838382] mb-3">Berlin Gym Equipment Outreach</p>
      
      <div className="bg-white rounded-lg border border-[#E8E7E6] p-4 mb-4">
        <p className="font-semibold text-sm text-[#5C5C5B] mb-2">Recipients</p>
        <p className="text-xs text-[#838382] mb-3">2 contacts from 1 company</p>
        
        <p className="font-semibold text-sm text-[#5C5C5B] mb-2">Emails</p>
        <p className="text-xs text-[#838382] mb-3">2 initial emails with 2 follow-ups each</p>
        
        <p className="font-semibold text-sm text-[#5C5C5B] mb-2">Timing</p>
        <p className="text-xs text-[#838382]">Initial emails to be sent immediately</p>
        <p className="text-xs text-[#838382]">Follow-ups scheduled over next 7 days</p>
      </div>
      
      {/* Send options */}
      <h3 className="text-sm font-semibold text-[#5C5C5B] mb-2">Send Options</h3>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button className="p-2.5 rounded-md bg-white border border-[#E8E7E6] text-[#5C5C5B] text-sm">
          Test
        </button>
        <button className="p-2.5 rounded-md bg-white border border-[#E8E7E6] text-[#5C5C5B] text-sm">
          Schedule
        </button>
        <button 
          className="p-2.5 rounded-md bg-white border border-[#5C5C5B] text-[#5C5C5B] text-sm"
          onClick={() => goToScreen('complete')}
        >
          Send Now
        </button>
      </div>
      
      {/* Save options */}
      <div className="grid grid-cols-2 gap-4">
        <button className="p-2.5 rounded-md bg-white border border-[#E8E7E6] text-[#5C5C5B] text-sm">
          Save as Template
        </button>
        <button className="p-2.5 rounded-md bg-white border border-[#E8E7E6] text-[#5C5C5B] text-sm">
          Save as Draft
        </button>
      </div>
    </div>
  );
};

// Campaign Complete component
const CampaignComplete = ({ goToScreen }) => {
  return (
    <div className="p-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#F6F0FF] flex items-center justify-center mx-auto mb-4">
        <span className="text-[#8E5ADF] text-2xl">✓</span>
      </div>
      
      <h2 className="text-lg font-semibold text-[#5C5C5B] mb-2">Campaign Launched!</h2>
      <p className="text-sm text-[#838382] mb-4">Your emails are on their way to recipients.</p>
      
      <p className="text-xs text-[#838382] mb-6">You'll be notified when you receive responses.</p>
      
      <button 
        className="w-full p-3 rounded-md bg-white border border-[#5C5C5B] text-[#5C5C5B] mb-3"
        onClick={() => goToScreen('dashboard')}
      >
        View Dashboard
      </button>
      
      <button 
        className="text-[#8E5ADF] text-sm"
        onClick={() => goToScreen('purpose')}
      >
        Start Another Campaign
      </button>
    </div>
  );
};

export default BuboPrototype;
