import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
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
      window.onNavigate(ROUTES_PATH.NewBill);
    });
    // Test unitaire: icon-mail
    test("Then the invoice icon in the vertical layout should be highlighted and the window icon should not be highlighted.", async () => {
      await screen.findByTestId("icon-window");
      const windowIcon = screen.getByTestId("icon-window");
      // Vérifier que l'icône de la fenêtre n'a pas la classe "active-icon"
      expect(windowIcon).not.toHaveClass("active-icon");
      await screen.findByTestId("icon-mail");
      // Vérifier que l'icône de la facture a la classe "active-icon"
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon).toHaveClass("active-icon");
    });

    test("Then I should submit the form", () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);

      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener("submit", handleSubmit);

      fireEvent.submit(formNewBill);

      expect(handleSubmit).toHaveBeenCalled();
    });
    test("Then form should be rendered", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const formNewBill = screen.getAllByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();
    });
    //Test pour vérifier que les champs du formulaire sont correctement affichés
    test("Then form inputs should be render correctly", () => {
      document.body.innerHTML = NewBillUI();

      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();

      const expenseType = screen.getAllByTestId("expense-type");
      expect(expenseType).toBeTruthy();

      const expenseName = screen.getByTestId("expense-name");
      expect(expenseName).toBeTruthy();

      const date = screen.getByTestId("datepicker");
      expect(date).toBeTruthy();

      const amount = screen.getByTestId("amount");
      expect(amount).toBeTruthy();

      const vat = screen.getByTestId("vat");
      expect(vat).toBeTruthy();

      const pct = screen.getByTestId("pct");
      expect(pct).toBeTruthy();

      const commentary = screen.getByTestId("commentary");
      expect(commentary).toBeTruthy();

      const file = screen.getByTestId("file");
      expect(file).toBeTruthy();

      const submitBtn = document.querySelector("#btn-send-bill");
      expect(submitBtn).toBeTruthy();

      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
    test("Then a form should be display", async () => {
      document.body.innerHTML = NewBillUI();
      const form = document.querySelector("form");
      expect(form.length).toEqual(9);
    });
  });

  //Test pour vérifier l'ajout d'un fichier avec la bonne extension
  describe("When A file with a correct format is upload", () => {
    test("Then verify the file bill", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
        store: mockStore,
      });
      // Récuperation des éléments à test
      const errorMessage = screen.getByTestId("error-msg");
      const fileUp = screen.getByTestId("file");
      // Simulation de la fonction "handleChangeFil"
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      // Création d'un file test.png pour le test de compatibilité
      const file = new File(["test"], "test.png", { type: "image/png" });
      // Fonction testé
      fileUp.addEventListener("change", handleChangeFile);
      fireEvent.change(fileUp, { target: { files: [file] } }); //Simulation de l'input fileUp avec le file de test
      // Test
      expect(handleChangeFile).toHaveBeenCalled(); //fonction est bien appelé
      expect(fileUp.files[0]).toStrictEqual(file); //le fichier est bien le meme que file (test.png)
    });
  });

  // Test pour vérifier que le message d'alerte est bien affiché dans le cas d'un fichier invalide
  describe("When A file with an incorrect format", () => {
    test("Then the file input value display no name with an error message ", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
        store: mockStore,
      });
      // Récuperation des éléments à test
      const errorMessage = screen.getByTestId("error-msg");
      const fileUp = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      // Création d'un file test.pdf pour le test de incompatibilité
      const file = new File(["test"], "test.pdf", { type: "image/pdf" });
      fileUp.addEventListener("change", (e) => handleChangeFile(e));
      fireEvent.change(fileUp, { target: { files: [file] } });

      expect(handleChangeFile).toHaveBeenCalled(); //fonction est bien appelé
      expect(errorMessage.classList.contains("visible")).toBeTruthy(); //le message d'erreur est visible
  });
  });
  // Test intégration: Post Bill

  describe("When I validate the form New Bill", () => {
    // test: Envoi Api simulé Post
    test("Then fetch invoices to mock POST API", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillInit = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    });

    describe("When an error occurs on API", () => {
      // Scénario de test : l'API renvoie une erreur 404
      test("Then the API failed and throw a 404 error", async () => {
        // Configurer l'utilisateur et l'environnement
        localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        // Initialise le magasin et l'instance NewBill
        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });
        // Mock  l'appel API à bills.create et lui fait générer une erreur 404
        const mockedBill = jest
          .spyOn(mockStore, "bills")
          .mockImplementationOnce(() => {
            return {
              create: jest.fn().mockRejectedValue(new Error("Erreur 404")),
            };
          });
        //On vérifie que l'appel API génère une erreur 404
        await expect(mockedBill().create).rejects.toThrow("Erreur 404");
        // Assertions après l'appel API
        expect(mockedBill).toHaveBeenCalled();
        expect(newBill.billId).toBeNull();
        expect(newBill.fileUrl).toBeNull();
        expect(newBill.fileName).toBeNull();
      });
      // Scénario de test : l'API renvoie une erreur 500
      test("Then the API failed and trow a 500 error", async () => {
        // Configurer l'utilisateur et l'environnement
        localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        // Initialise le magasin et l'instance NewBill
        const store = mockStore;
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage,
        });
        // Mock  l'appel API à bills.create et lui fait générer une erreur 500
        const mockedBill = jest
          .spyOn(mockStore, "bills")
          .mockImplementationOnce(() => {
            return {
              create: jest.fn().mockRejectedValue(new Error("Erreur 500")),
            };
          });
        // On verifie  que l'appel API génère une erreur 500
        await expect(mockedBill().create).rejects.toThrow("Erreur 500");
        // Assertions après l'appel API
        expect(mockedBill).toHaveBeenCalled();
        expect(newBill.billId).toBeNull();
        expect(newBill.fileUrl).toBeNull();
        expect(newBill.fileName).toBeNull();
      });
    });
  });
});
