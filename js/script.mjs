import { API_PRODUCTS_URL } from "./constants.mjs";

document.addEventListener("DOMContentLoaded", async function () {
  function updateBasketView() {
    const basketItemsContainer = document.getElementById("basket-items");
    let basketItems = JSON.parse(localStorage.getItem("basketItems")) || [];

    basketItemsContainer.innerHTML = "";

    basketItems.forEach((item) => {
      const basketItem = document.createElement("div");
      basketItem.classList.add("jacketbox2");

      basketItem.innerHTML = `
  <div class="jacketpicbox2">
    <a href="../products/product.html?id=${item.id}"><img src="${
        item.image
      }" alt="${item.name}"></a>
  </div>
  <div class="jackettextbox2">
    <h4>${item.name}</h4>
    <p>${item.description || "Description not available"}</p>
    <p>Size: ${item.size}</p> <!-- Add size here -->
    <p>$${item.price}</p>
  </div>
  <div class="button-container">
    <button class="remove-from-basket" data-id="${item.id}">Remove</button>
  </div>
`;
      basketItemsContainer.appendChild(basketItem);
    });

    calculateOrderSummary(basketItems);
  }

  async function calculateOrderSummary(basketItems) {
    const subtotal = basketItems.reduce(
      (total, item) => total + parseFloat(item.price),
      0
    );
    const delivery = 0;
    const total = subtotal + delivery;

    const orderSummary = document.getElementById("order-summary");
    orderSummary.innerHTML = `
      <h2>Order Summary</h2>
      <div id="subtotal">Subtotal: $${subtotal.toFixed(2)}</div>
      <div id="delivery">Delivery: Free</div>
      <div id="total">Total: $${total.toFixed(2)}</div>
      <a id="checkout-button" href="checkoutsuccess/checkoutsuccess.html">Pay</a>
    `;
  }

  function addToBasket(product) {
    let basketItems = JSON.parse(localStorage.getItem("basketItems")) || [];

    basketItems.push({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.image?.url,
      description: product.description,
      size: product.size,
    });

    localStorage.setItem("basketItems", JSON.stringify(basketItems));

    updateBasketView();
  }

  document.addEventListener("click", async function (event) {
    if (event.target.classList.contains("add-to-basket")) {
      const productId = event.target.getAttribute("data-id");
      const productName = event.target.getAttribute("data-name");
      const productPrice = event.target.getAttribute("data-price");
      const productImage = event.target.getAttribute("data-image");
      const productDescription = event.target.getAttribute("data-description");
      const productSize =
        event.target.parentElement.querySelector(".size-dropdown").value;

      let basketItems = JSON.parse(localStorage.getItem("basketItems")) || [];

      basketItems.push({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        description: productDescription,
        size: productSize,
      });

      localStorage.setItem("basketItems", JSON.stringify(basketItems));

      updateBasketView();
    } else if (event.target.classList.contains("remove-from-basket")) {
      const productId = event.target.getAttribute("data-id");

      let basketItems = JSON.parse(localStorage.getItem("basketItems")) || [];

      const indexToRemove = basketItems.findIndex(
        (item) => item.id === productId
      );

      if (indexToRemove !== -1) {
        basketItems.splice(indexToRemove, 1);
        localStorage.setItem("basketItems", JSON.stringify(basketItems));
      }

      updateBasketView();
    }
  });

  try {
    const spinnerContainer = document.getElementById("spinner-container");
    spinnerContainer.style.display = "block";

    const response = await fetch(API_PRODUCTS_URL);
    const data = await response.json();
    const productList = document.getElementById("product-listing");

    const filterProductsByGender = (products, gender) => {
      if (gender === "all") {
        return products;
      } else {
        return products.filter((product) => product.gender === gender);
      }
    };

    const renderProducts = (products) => {
      productList.innerHTML = "";
      products.forEach((product) => {
        const productElement = document.createElement("div");
        productElement.classList.add("jacketbox2");
        productElement.innerHTML = `
              <div class="jacketpicbox2">
              <a href="pages/products/product.html?id=${
                product.id
              }"><img src="${product.image?.url}" alt="${product.name}"></a>
              </div>
              <div class="jackettextbox2">
                <h4>${product.title}</h4>
                <p>${product.description || "Description not available"}</p>
                <p>$${product.price}</p>
                
              </div>
              <div class="button-container">
              <div>
                  <label for="size">Size:</label>
                  <select class="size-dropdown" name="size">
                    ${product.sizes
                      .map((size) => `<option value="${size}">${size}</option>`)
                      .join("")}
                  </select>
                </div>
                <button class="add-to-basket" data-id="${
                  product.id
                }" data-name="${product.title}" data-price="${
          product.price
        }" data-image="${product.image?.url}" data-description="${
          product.description
        }">Add to Cart</button>
              </div>
            `;
        productList.appendChild(productElement);
      });
    };

    renderProducts(data.data);

    const genderFilter = document.getElementById("gender-filter");
    genderFilter.addEventListener("change", (event) => {
      const selectedGender = event.target.value;
      const filteredProducts = filterProductsByGender(
        data.data,
        selectedGender
      );
      renderProducts(filteredProducts);
    });

    spinnerContainer.style.display = "none";
  } catch (error) {
    console.error("Error fetching product data:", error);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (productId) {
    try {
      const response = await fetch(`${API_PRODUCTS_URL}/${productId}`);
      const productData = await response.json();

      if (productData && productData.data) {
        const product = productData.data;

        document.getElementById("product-name").textContent = product.title;
        document.getElementById("product-description").textContent =
          product.description || "Description not available";
        document.getElementById(
          "product-price"
        ).textContent = `$${product.price}`;

        const productImage = document.getElementById("product-image");
        productImage.src = product.image?.url || "";
        productImage.alt = product.title;

        const sizeDropdown = document.getElementById("size-dropdown");
        product.sizes.forEach((size) => {
          const option = document.createElement("option");
          option.value = size;
          option.textContent = size;
          sizeDropdown.appendChild(option);
        });

        const addToCartButton = document.getElementById("add-to-cart");
        addToCartButton.addEventListener("click", () => {
          const selectedSize = sizeDropdown.value;
          addToBasket({ ...product, size: selectedSize });
        });
      } else {
        console.error("Product not found with ID:", productId);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  }

  updateBasketView();
});
