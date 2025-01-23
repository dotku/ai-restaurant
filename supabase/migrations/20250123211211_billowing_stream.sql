/*
  # Update Falafel Plate image URL
  
  Updates the image URL for the Falafel Plate menu item to use a new, working image URL.
*/

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?auto=format&fit=crop&w=800'
WHERE name = 'Falafel Plate';