/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import { screen, waitFor, fireEvent} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store.js"
import { ROUTES ,ROUTES_PATH} from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import { sessionStorageMock } from "../__mocks__/sessionStorage.js";

 // Mock du module "../app/Store"
jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    /*  test si affichage page de "Envoyer une note de frais" */
    test('Then it should display NewBill page', () => {
      document.body.innerHTML = NewBillUI()
      /* vérification présence texte "Envoyer une note de frais" à l'écran */
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
    test("Then the invoice icon in the vertical layout should be highlighted and the mail icon is not highlighted ", async () => {
      // Simulation des donnée dans le locale storage
      jest.spyOn(mockStore, "bills")
      sessionStorageMock("Employee");
      document.body.innerHTML = '<div id="root"></div>';
      router();
      window.onNavigate(ROUTES_PATH.NewBill)
      
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).not.toBeTruthy();
      expect(mailIcon.classList.contains("active-icon")).toBeTruthy();
    });
  })
})