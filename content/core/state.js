// State management for the Bubo extension
(function() {
  // Main state object
  let state = {
    currentScreen: 'dashboard',
    apiStatus: {
      hunterConnected: false,
      gmailConnected: false
    },
    purpose: '',
    segmentation: {
      size: false,
      employees: false,
      location: false,
      industry: false
    },
    companies: [],
    selectedCompanies: [],
    contacts: [],
    selectedContacts: [],
    emails: [],
    followups: [],
    activeCampaigns: []
  };
  
  // Sample data for prototype
  const sampleCompanies = [
    { id: 1, name: 'FitLife Berlin', industry: 'Fitness Studios', employees: '250-500', selected: false },
    { id: 2, name: 'GymTech GmbH', industry: 'Equipment Retailer', employees: '50-200', selected: false },
    { id: 3, name: 'SportHaus', industry: 'Sporting Goods', employees: '100-250', selected: false },
  ];
  
  const sampleContacts = [
    { id: 1, name: 'Sarah Müller', role: 'Head of Purchasing', email: 's.mueller@fitlife-berlin.de', company: 'FitLife Berlin', match: 95, selected: false },
    { id: 2, name: 'Thomas Weber', role: 'Operations Director', email: 't.weber@fitlife-berlin.de', company: 'FitLife Berlin', match: 80, selected: false },
    { id: 3, name: 'Jan Becker', role: 'CEO', email: 'j.becker@gymtech.de', company: 'GymTech GmbH', match: 90, selected: false },
  ];
  
  // Initialize with sample data for prototype
  state.companies = sampleCompanies;
  state.contacts = sampleContacts;
  
  // Event listeners
  const listeners = {};
  
  // Update state and notify listeners
  const setState = (newState) => {
    state = { ...state, ...newState };
    notifyListeners();
  };
  
  // Get current state
  const getState = () => {
    return { ...state };
  };
  
  // Subscribe to state changes
  const subscribe = (key, callback) => {
    if (!listeners[key]) {
      listeners[key] = [];
    }
    listeners[key].push(callback);
    
    // Return unsubscribe function
    return () => {
      listeners[key] = listeners[key].filter(cb => cb !== callback);
    };
  };
  
  // Notify listeners of state changes
  const notifyListeners = () => {
    Object.keys(listeners).forEach(key => {
      listeners[key].forEach(callback => {
        callback(state);
      });
    });
  };
  
  // Navigate to screen
  const goToScreen = (screen) => {
    setState({ currentScreen: screen });
  };
  
  // Toggle company selection
  const toggleCompanySelection = (id) => {
    const updatedCompanies = [...state.companies];
    const index = updatedCompanies.findIndex(company => company.id === id);
    if (index !== -1) {
      updatedCompanies[index].selected = !updatedCompanies[index].selected;
      setState({ 
        companies: updatedCompanies,
        selectedCompanies: updatedCompanies.filter(company => company.selected)
      });
    }
  };
  
  // Toggle contact selection
  const toggleContactSelection = (id) => {
    const updatedContacts = [...state.contacts];
    const index = updatedContacts.findIndex(contact => contact.id === id);
    if (index !== -1) {
      updatedContacts[index].selected = !updatedContacts[index].selected;
      setState({ 
        contacts: updatedContacts,
        selectedContacts: updatedContacts.filter(contact => contact.selected)
      });
    }
  };
  
  // Public API
  window.BuboState = {
    getState,
    setState,
    subscribe,
    goToScreen,
    toggleCompanySelection,
    toggleContactSelection
  };
  
  console.log('BuboState initialized');
})();