import { screen, waitFor, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { sessionStorageMock } from "../__mocks__/sessionStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
jest.mock("../app/Store", () => mockStore);

//Étant donné que je suis connecté en tant qu'employé
describe("Given I am connected as an employee", () => {
  //Quand je suis sur la page Bills(factures)
  describe("When I am on Bills Page", () => {
    //Ensuite, l'icône de la facture dans la disposition verticale doit être mise en surbrillance
    test("Then the invoice icon in the vertical layout should be highlighted and the mail icon is not highlighted ", async () => {
      // Simulation des donnée dans le locale storage
      sessionStorageMock("Employee");
      document.body.innerHTML = '<div id="root"></div>';
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
      expect(mailIcon.classList.contains("active-icon")).not.toBeTruthy();
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

    //action et affichage modale quand clic bouton "nouvelle note de frais"
    describe("When I click on new bill button ", () => {
      test("Then a modal should open", () => {
        sessionStorageMock("Employee");
        document.body.innerHTML = BillsUI({ data: bills });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const newBill = new Bills({
          document,
          onNavigate,
          store: null,
          bills,
          localStorage: localStorageMock,
        });
        const handleClickNewBill = jest.fn((e) =>
          newBill.handleClickNewBill(e, bills)
        );
        const iconNewBill = screen.getByTestId("btn-new-bill");
        iconNewBill.addEventListener("click", handleClickNewBill);
        fireEvent.click(iconNewBill);
        //vérification de l'appel de la fonction handleClickNewBill
        expect(handleClickNewBill).toHaveBeenCalled();
        //vérification de l'affichage de la modale par la présence du noeud DOM id="form-new-bill")

        const modale = screen.getAllByTestId("form-new-bill");
        expect(modale).toBeTruthy();
      });
    });
    // test action et affichage modale quand clic icône oeil bleu
    describe("When I click on the blue eye icon", () => {
      test("Then modal should be displayed with its content", async () => {
        sessionStorageMock("Employee");
        document.body.innerHTML = '<div id="root"></div>';
        router();
        window.onNavigate(ROUTES_PATH.Bills);
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        $.fn.modal = jest.fn(function () {
          this[0].classList.add("show");
        });
        const billsList = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: null,
        });
        const bills = await billsList.getBills();
        document.body.innerHTML = BillsUI({ data: bills });
        const firstEye = screen.getAllByTestId("icon-eye").shift();
        const handleClickIconEye = jest.fn(() =>
          billsList.handleClickIconEye(firstEye)
        );
        firstEye.addEventListener("click", handleClickIconEye);
        userEvent.click(firstEye);
        // vérification de l'appel de la fonction handleClickIconEye
        expect(handleClickIconEye).toBeCalled();
        //vérification de l'affichage de la modale par la présence de la classe .show
        expect(document.querySelector(".show")).toBeTruthy();
      });
    });
    // Test entrée avec paramètre de la page Note de frais
    describe("When I enter on Bills Page with parameter", () => {
      // test avec paramètre chargement
      test("Then it calls the LoadingPage function", () => {
        document.body.innerHTML = BillsUI({ loading: true });
        expect(screen.getAllByText("Loading...")).toBeTruthy();
      });
      // test avec paramètre erreur
      test("Then it calls the ErrorPage function", () => {
        document.body.innerHTML = BillsUI({ error: "C'est une erreur" });
        expect(screen.getAllByText("C'est une erreur")).toBeTruthy();
      });
    });
    //test  integration GET//

    test("Then it should display the spawn notes", async () => {
      sessionStorageMock("Employee");
      document.body.innerHTML = '<div id="root"></div>';
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const billsList = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: null,
      });
      const bills = await billsList.getBills();
      document.body.innerHTML = BillsUI({ data: bills });
      const billsCount = screen.getByTestId("tbody").childElementCount;
      //verification que les 4 bill du mock sont récupérées
      expect(billsCount).toEqual(4);
    });
    //test de la gestion d'erreur venant de l'api
    describe("When an error occurs on API", () => {
      //test message erreur 404
      test("then fetches bills from an API and fails with 404 message error", async () => {
        jest.spyOn(mockStore, "bills");
        sessionStorageMock("Employee");
        document.body.innerHTML = '<div id="root"></div>';
        router();
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        // vérification présence message d'erreur contenant texte Erreur 404
        expect(message).toBeTruthy();
      });
      //test message erreur 500
      test("then fetches bills from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        // vérification présence message d'erreur contenant texte  Erreur 500
        expect(message).toBeTruthy();
      });
    });
  });
});
