// tests/unit/housing.test.js
import { fetchPage, renderPage, renderPagination } from '../layout/model_counseling/counseling_model.js';

describe('Counseling Model Unit Tests', () => {

  beforeEach(() => {
    document.body.innerHTML = `<div id="housing-cards"></div><ul id="pagination-controls"></ul>`;
  });

  test('fetchPage should call API with correct page number', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ data: [], meta: { total: 0 } }) })
    );

    await fetchPage(1);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('page[number]=1'));
  });

  test('renderPage should render correct number of cards', () => {
    const mockData = [
      { id: 1, attributes: { name: 'Housing A', address: 'Addr A', category: 'Cat A', photo_url: '' } },
      { id: 2, attributes: { name: 'Housing B', address: 'Addr B', category: 'Cat B', photo_url: '' } }
    ];
    global.data = mockData;
    renderPage();
    const cards = document.querySelectorAll('#housing-cards .card');
    expect(cards.length).toBe(2);
  });

  test('renderPagination should create correct page buttons', () => {
    global.totalPages = 3;
    global.currentPage = 2;
    renderPagination();
    const activeBtn = document.querySelector('.page-item.active');
    expect(activeBtn.textContent).toBe('2');
  });

});
