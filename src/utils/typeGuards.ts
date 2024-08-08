
// utils/typeGuards.ts

import { VenueSection, ParkingSection, IndoorSection, DiningSection } from '../entity/models/OrgPostEntity';


function isParkingSection(section: VenueSection | ParkingSection): section is ParkingSection {
    return (section as ParkingSection).carParkingSpace !== undefined;
  }
  
  function isIndoorSection(section: VenueSection | IndoorSection): section is IndoorSection {
    return (section as IndoorSection).seatingCapacity !== undefined;
  }
  
  function isDiningSection(section: VenueSection | DiningSection): section is DiningSection {
    return (section as DiningSection).diningCapacity !== undefined;
  }
  
  export { isParkingSection, isIndoorSection, isDiningSection };
  