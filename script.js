
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const destinationCards = document.querySelectorAll(".destination-card");
  const emptyMessage = document.getElementById("emptyMessage");
  const favoriteCount = document.getElementById("favoriteCount");

  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  const destinationDialog = document.getElementById("destinationDialog");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogText = document.getElementById("dialogText");
  const dialogClose = document.getElementById("dialogClose");
  const dialogDone = document.getElementById("dialogDone");

  let selectedCategory = "all";

  const destinationInfo = {
    "Bali": "Bali, Indonesia, is known for tropical beaches, green rice terraces, waterfalls, and beautiful temples. Research local customs and seasonal weather before planning your trip.",
    "Swiss Alps": "The Swiss Alps offer dramatic mountain scenery, hiking trails, ski resorts, and picturesque villages. Check trail conditions and seasonal transport before visiting.",
    "Paris": "Paris, France, is famous for the Eiffel Tower, museums, historic streets, and cafés. Reserve popular attractions ahead of time when possible.",
    "Maldives": "The Maldives is an island destination known for turquoise water, coral reefs, and sandy beaches. Check island transfers and local travel requirements before booking.",
    "Hunza Valley": "Hunza Valley in northern Pakistan offers spectacular mountain views, traditional culture, and scenic villages. Check road conditions and weather before travelling.",
    "Istanbul": "Istanbul, Türkiye, brings together historic architecture, lively bazaars, waterfront views, and rich culinary traditions. Check attraction opening hours before your visit."
  };

  // Set the current year in the footer.
  document.getElementById("year").textContent = new Date().getFullYear();

  // Safely read saved browser preferences.
  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // The website remains usable if browser storage is unavailable.
    }
  }

  // DARK MODE
  function updateThemeButton() {
    const isDark = document.body.classList.contains("dark");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  if (readStorage("travelExplorerTheme", "light") === "dark") {
    document.body.classList.add("dark");
  }

  updateThemeButton();

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const theme = document.body.classList.contains("dark")
      ? "dark"
      : "light";

    saveStorage("travelExplorerTheme", theme);
    updateThemeButton();
  });

  // MOBILE NAVIGATION
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });

  // DESTINATION SEARCH AND CATEGORY FILTER
  function filterDestinations() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    destinationCards.forEach((card) => {
      const category = card.dataset.category;
      const name = card.dataset.name.toLowerCase();
      const text = card.textContent.toLowerCase();

      const matchesCategory =
        selectedCategory === "all" || category === selectedCategory;

      const matchesSearch =
        name.includes(searchTerm) || text.includes(searchTerm);

      const shouldShow = matchesCategory && matchesSearch;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCount++;
      }
    });

    emptyMessage.hidden = visibleCount !== 0;
  }

  searchInput.addEventListener("input", filterDestinations);

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;

      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      filterDestinations();
    });

    button.setAttribute(
      "aria-pressed",
      String(button.classList.contains("active"))
    );
  });

  // FAVORITES
  let favorites = [];

  try {
    const savedFavorites = JSON.parse(
      readStorage("travelExplorerFavorites", "[]")
    );

    if (Array.isArray(savedFavorites)) {
      favorites = savedFavorites.filter(
        (name) => typeof name === "string" && destinationInfo[name]
      );
    }
  } catch (error) {
    favorites = [];
  }

  function updateFavorites() {
    document.querySelectorAll(".destination-card").forEach((card) => {
      const name = card.querySelector(".details-btn").dataset.place;
      const button = card.querySelector(".favorite-btn");
      const isFavorite = favorites.includes(name);

      button.classList.toggle("selected", isFavorite);
      button.textContent = isFavorite ? "♥" : "♡";
      button.setAttribute("aria-pressed", String(isFavorite));
      button.setAttribute(
        "aria-label",
        `${isFavorite ? "Remove" : "Add"} ${name} ${isFavorite ? "from" : "to"} favorites`
      );
    });

    favoriteCount.textContent = favorites.length;
    saveStorage("travelExplorerFavorites", JSON.stringify(favorites));
  }

  document.querySelectorAll(".favorite-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".destination-card");
      const name = card.querySelector(".details-btn").dataset.place;

      if (favorites.includes(name)) {
        favorites = favorites.filter((item) => item !== name);
      } else {
        favorites.push(name);
      }

      updateFavorites();
    });
  });

  updateFavorites();

  // DESTINATION DETAILS POPUP
  document.querySelectorAll(".details-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.place;

      dialogTitle.textContent = name;
      dialogText.textContent =
        destinationInfo[name] || "Discover this beautiful destination.";

      destinationDialog.showModal();
    });
  });

  function closeDialog() {
    destinationDialog.close();
  }

  dialogClose.addEventListener("click", closeDialog);
  dialogDone.addEventListener("click", closeDialog);

  // Close the popup when the user clicks outside its content.
  destinationDialog.addEventListener("click", (event) => {
    if (event.target === destinationDialog) {
      closeDialog();
    }
  });

  // CONTACT FORM
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    formStatus.textContent =
      `Thank you, ${name}! Your message has been prepared successfully.`;

    contactForm.reset();
  });
});
