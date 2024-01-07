import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
jest.mock("../app/Store", () => mockStore);
//Étant donné que je suis connecté en tant qu'employé
describe("Given I am connected as an employee", () => {
  //Quand je suis sur la page Bills(factures)
  describe("When I am on Bills Page", () => {
    //Ensuite, l'icône de la facture dans la disposition verticale doit être mise en surbrillance
    test("Then bill icon in vertical layout should be highlighted ", async () => {
      // Simulation des donnée dans le locale storage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
      expect(mailIcon.classList.contains("active-icon")).not.toBeTruthy();
    });
  });
  // Ensuite les notes doivent être en ordre croissant
  test("Then bills should be ordered from  earliest to latest", () => {
    document.body.innerHTML = BillsUI({ data: bills });
    const dates = screen
      .getAllByText(
        /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
      )
      .map((a) => a.innerHTML);
    const antiChrono = (a, b) => (a < b ? 1 : -1);
    const datesSorted = [...dates].sort(antiChrono);
    expect(dates).toEqual(datesSorted);
  });
  describe("Given the bills container is initialized", () => {
    test("When clicking on the new bill button, i go to the form bill", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const store = null
      const billsContainer = new Bills({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })

      const newBillButton = screen.getByTestId("btn-new-bill")
      const handleClickNewBill = jest.fn(() => billsContainer.handleClickNewBill())

      newBillButton.addEventListener("click", handleClickNewBill)
      fireEvent.click(newBillButton)

      expect(handleClickNewBill).toHaveBeenCalled()

      const formNewBill = screen.queryByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()
    });
  });
});
