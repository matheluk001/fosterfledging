// frontend.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";


import Navbar from "../src/components/Navbar";
import SplashPage from "../src/pages/SplashPage";
import ModelPage from "../src/pages/ModelPage";   
import SearchBar from "../src/components/SearchBar";
import InstancePage from "../src/pages/InstancePage";
import Pagination from "../src/components/Pagination";
import GlobalSearchPage from "../src/pages/GlobalSearchPage";
import About from "../src/pages/About";

global.fetch = jest.fn(); 


const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};



// TEST 1 — Navbar renders all main links
test("Navbar renders navigation links", () => {
  renderWithRouter(<Navbar />);
  expect(screen.getByText(/home/i)).toBeInTheDocument();
  expect(screen.getByText(/about/i)).toBeInTheDocument();
  expect(screen.getByText(/search/i)).toBeInTheDocument();
});


// TEST 2 — SplashPage fetches API and displays cards
test("SplashPage fetches featured instances and displays them", async () => {
  global.fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue([
      { id: 1, name: "Test Instance A" },
      { id: 2, name: "Test Instance B" }
    ])
  });

  renderWithRouter(<SplashPage />);

  const cardA = await waitFor(() =>
    screen.getByText(/Test Instance A/i)
  );
  const cardB = screen.getByText(/Test Instance B/i);

  expect(cardA).toBeInTheDocument();
  expect(cardB).toBeInTheDocument();
});


// TEST 3 — ModelPage displays correct number of cards
test("ModelPage displays all instance cards", async () => {
  global.fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue([
      { id: 1, name: "A" },
      { id: 2, name: "B" },
      { id: 3, name: "C" }
    ])
  });

  renderWithRouter(<ModelPage model="housing" />);

  const items = await waitFor(() =>
    screen.getAllByTestId("instance-card")
  );

  expect(items.length).toBe(3);
});


// TEST 4 — Sorting updates display order
test("ModelPage sorting updates order", async () => {
  global.fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue([
      { id: 1, name: "Zulu" },
      { id: 2, name: "Alpha" }
    ])
  });

  renderWithRouter(<ModelPage model="housing" />);

  const sortButton = await waitFor(() =>
    screen.getByRole("button", { name: /sort/i })
  );

  fireEvent.click(sortButton);
  fireEvent.click(screen.getByText(/A–Z/i));

  const cards = screen.getAllByTestId("instance-card");
  expect(cards[0]).toHaveTextContent("Alpha");
});


// TEST 5 — Filtering reduces visible results
test("ModelPage filtering hides non-matching items", async () => {
  global.fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue([
      { id: 1, name: "Austin", region: "Texas" },
      { id: 2, name: "Chicago", region: "Illinois" }
    ])
  });

  renderWithRouter(<ModelPage model="housing" />);

  const filterButton = await waitFor(() =>
    screen.getByRole("button", { name: /filter/i })
  );

  fireEvent.click(filterButton);
  fireEvent.click(screen.getByText(/Texas/i));

  const items = screen.getAllByTestId("instance-card");
  expect(items.length).toBe(1);
  expect(items[0]).toHaveTextContent("Austin");
});


// TEST 6 — SearchBar triggers callback with user input
test("SearchBar triggers onSearch with correct text", () => {
  const mockSearch = jest.fn();

  render(<SearchBar onSearch={mockSearch} />);

  const input = screen.getByPlaceholderText(/search/i);
  fireEvent.change(input, { target: { value: "foster youth housing" } });

  const button = screen.getByRole("button", { name: /search/i });
  fireEvent.click(button);

  expect(mockSearch).toHaveBeenCalledWith("foster youth housing");
  expect(mockSearch).toHaveBeenCalledTimes(1);
});


// TEST 7 — InstancePage shows connected instances
test("InstancePage shows related instances", async () => {
  global.fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue({
      id: 1,
      name: "Instance X",
      connections: [
        { id: 11, name: "Related A" },
        { id: 12, name: "Related B" }
      ]
    })
  });

  renderWithRouter(<InstancePage id="1" />);

  const a = await waitFor(() => screen.getByText(/Related A/i));
  const b = screen.getByText(/Related B/i);

  expect(a).toBeInTheDocument();
  expect(b).toBeInTheDocument();
});


// TEST 8 — Pagination generates correct number of pages
test("Pagination shows correct number of page buttons", () => {
  render(<Pagination totalItems={45} pageSize={10} currentPage={1} />);

  const buttons = screen.getAllByRole("button");
  // Expected buttons: 1, 2, 3, 4, 5
  expect(buttons.length).toBeGreaterThanOrEqual(5);
});


// TEST 9 — GlobalSearchPage highlights matching query
test("GlobalSearchPage highlights query text", async () => {
  global.fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValue([
      { id: 1, name: "The quick fox" }
    ])
  });

  renderWithRouter(<GlobalSearchPage />);

  const input = screen.getByPlaceholderText(/search/i);
  fireEvent.change(input, { target: { value: "quick fox" } });

  fireEvent.click(screen.getByRole("button", { name: /search/i }));

  const highlight = await waitFor(() =>
    screen.getByTestId("highlight")
  );

  expect(highlight).toHaveTextContent("quick fox");
});


// TEST 10 — About page displays team member info & stats
// test("About page displays member stats and commit counts", async () => {
//   global.fetch.mockResolvedValueOnce({
//     json: jest.fn().mockResolvedValue({
//       members: [
//         { name: "Danyal", commits: 42, issues: 10, tests: 12 },
//         { name: "Gora", commits: 31, issues: 8, tests: 11 }
//       ]
//     })
//   });

//   renderWithRouter(<About />);

//   const danyal = await waitFor(() =>
//     screen.getByText(/Danyal/i)
//   );
//   expect(danyal).toBeInTheDocument();

//   expect(screen.getByText(/42/)).toBeInTheDocument();
//   expect(screen.getByText(/10/)).toBeInTheDocument();
//   expect(screen.getByText(/12/)).toBeInTheDocument();
// });
