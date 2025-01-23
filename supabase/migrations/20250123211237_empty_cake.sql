/*
  # Update Falafel Plate image URL
  
  Updates the image URL for the Falafel Plate menu item to use a new, high-quality image.
*/

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800'
WHERE name = 'Falafel Plate';