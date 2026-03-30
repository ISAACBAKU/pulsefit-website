const reveals = document.querySelectorAll(".reveal");
const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-menu a");

// REVEAL ON SCROLL
function revealOnScroll() {
  const windowHeight = window.innerHeight;

  reveals.forEach((section) => {
    const elementTop = section.getBoundingClientRect().top;
    const revealPoint = 100;

    if (elementTop < windowHeight - revealPoint) {
      section.classList.add("active");

      const items = section.querySelectorAll(".reveal-item");

      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add("active");
        }, index * 250);
      });
    }
  });
}

// NAVBAR SHOW ONLY AT TOP
function handleNavbar() {
  if (window.innerWidth <= 768) {
    navbar.classList.remove("hide");
    return;
  }

  if (window.scrollY > 50) {
    navbar.classList.add("hide");
  } else {
    navbar.classList.remove("hide");
  }
}

// MOBILE MENU TOGGLE
menuToggle.addEventListener("click", () => {
  mobileMenu.classList.toggle("active");

  if (mobileMenu.classList.contains("active")) {
    menuToggle.textContent = "✕";
  } else {
    menuToggle.textContent = "☰";
  }
});

// CLOSE MENU WHEN LINK IS CLICKED
mobileLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    menuToggle.textContent = "☰";
  });
});

window.addEventListener("scroll", () => {
  revealOnScroll();
  handleNavbar();
});

window.addEventListener("load", () => {
  revealOnScroll();
  handleNavbar();
});

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      goal: formData.get("goal"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        formStatus.textContent = data.message;
        contactForm.reset();
      } else {
        formStatus.textContent = data.message || "Something went wrong.";
      }
    } catch (error) {
      formStatus.textContent = "Server error. Please try again.";
    }
  });
}

