import Restaurant from "../models/restaurant.js"

// Create a new restaurant
export const createRestaurant = async (req, res) => {
  try {
    const { name, description, address, phone, cuisine, image } = req.body

    const restaurant = new Restaurant({
      name,
      description,
      address,
      phone,
      cuisine,
      image,
      owner: req.userId,
      menu: [],
    })

    await restaurant.save()

    res.status(201).json(restaurant)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Get all restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 })
    res.status(200).json(restaurants)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Get restaurants by owner
export const getRestaurantsByOwner = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.userId }).sort({ createdAt: -1 })
    res.status(200).json(restaurants)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Get restaurant by ID
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    res.status(200).json(restaurant)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Update restaurant
export const updateRestaurant = async (req, res) => {
  try {
    const { name, description, address, phone, cuisine, image, isOpen } = req.body

    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    // Check if the user is the owner
    if (restaurant.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to update this restaurant" })
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { name, description, address, phone, cuisine, image, isOpen },
      { new: true },
    )

    res.status(200).json(updatedRestaurant)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Add menu item
export const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body

    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    // Check if the user is the owner
    if (restaurant.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to update this restaurant" })
    }

    const menuItem = {
      name,
      description,
      price,
      category,
      image,
    }

    restaurant.menu.push(menuItem)
    await restaurant.save()

    res.status(201).json(restaurant)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image, isAvailable } = req.body

    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    // Check if the user is the owner
    if (restaurant.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to update this restaurant" })
    }

    const menuItemIndex = restaurant.menu.findIndex((item) => item._id.toString() === req.params.itemId)

    if (menuItemIndex === -1) {
      return res.status(404).json({ message: "Menu item not found" })
    }

    restaurant.menu[menuItemIndex] = {
      ...restaurant.menu[menuItemIndex],
      name: name || restaurant.menu[menuItemIndex].name,
      description: description || restaurant.menu[menuItemIndex].description,
      price: price || restaurant.menu[menuItemIndex].price,
      category: category || restaurant.menu[menuItemIndex].category,
      image: image || restaurant.menu[menuItemIndex].image,
      isAvailable: isAvailable !== undefined ? isAvailable : restaurant.menu[menuItemIndex].isAvailable,
    }

    await restaurant.save()

    res.status(200).json(restaurant)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    // Check if the user is the owner
    if (restaurant.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to update this restaurant" })
    }

    restaurant.menu = restaurant.menu.filter((item) => item._id.toString() !== req.params.itemId)

    await restaurant.save()

    res.status(200).json(restaurant)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message })
  }
}

