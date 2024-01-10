/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { sessionStorageMock } from "../__mocks__/sessionStorage.js";

// Mock du module "../app/Store"
jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    document.body.innerHTML = NewBillUI();
    sessionStorageMock("Employee");
    document.body.innerHTML = '<div id="root"></div>';
    router();
    window.onNavigate(ROUTES_PATH.NewBill);
  });
  describe("When I am on NewBill Page", () => {
    /*  test si affichage page de "Envoyer une note de frais" */
    test("Then it should display NewBill page", () => {
      document.body.innerHTML = NewBillUI();
      /* vérification présence texte "Envoyer une note de frais" à l'écran */
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
    test("Then the mail icon in the vertical layout should be highlighted and the invoice icon is not highlighted ", async () => {
      // Simulation des donnée dans le locale storage
      jest.spyOn(mockStore, "bills");
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      //Vérification que l'icône window n'est pas en surbrillance
      expect(windowIcon.classList.contains("active-icon")).not.toBeTruthy();
      //Vérification que le noeud DOM comportant id='icon-mail' comporte la classe active-icon
      expect(mailIcon.classList.contains("active-icon")).toBeTruthy();
    });

    //Test sélection d'un fichier avec un format valide lors de l'upload dans l'input du justificatif
    test("Then uploading  a valid file : JPG/JPEG/PNG extension", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const fileInput = screen.getByTestId("file");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      fileInput.addEventListener("change", (e) => handleChangeFile(e));
      const file = new File(["tested file"], "validFile.png", {
        type: "image/png",
      });
      userEvent.upload(fileInput, file);
      // Vérification de l'appel de fonction handleChangeFile
      expect(handleChangeFile).toHaveBeenCalled();
      // Vérification de l'objet file correspond au fichier sélectionné
      expect(fileInput.files[0]).toStrictEqual(file);
    });
    test("Then uploading  a invalid file : not JPG/JPEG/PNG extension", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const fileInput = screen.getByTestId("file");
      const msgError = screen.getByTestId("error-msg");
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      fileInput.addEventListener("change", (e) => handleChangeFile(e));
      const file = new File(["tested file"], "invalidFile.pdf", {
        type: "application/pdf",
      });
      userEvent.upload(fileInput, file);
      // Vérification de l'appel de fonction handleChangeFile
      expect(handleChangeFile).toHaveBeenCalled();
      // Vérification que le champs fileInput est réinitialisé
      expect(fileInput.value).toBe("");
      // Vérifier que le message d'erreur s'affiche
      expect(msgError.classList.contains("visible")).toBeTruthy();
    });
    test("Then, by clicking on the button, you should submit the spawning note form", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      //test le formulaire
      const mockedNewBill = {
        type: "Restaurants et bars",
        name: "repas ",
        date: "2022-10-10",
        amount: 10,
        vat: 50,
        pct: 10,
        commentary: "Test",
        fileUrl: "../img/validFile.png",
        fileName: "validFile.png",
        status: "pending",
      };
      //on rempli les champs note de frai
      screen.getByTestId("expense-type").value = mockedNewBill.type;
      screen.getByTestId("expense-name").value = mockedNewBill.name;
      screen.getByTestId("datepicker").value = mockedNewBill.date;
      screen.getByTestId("amount").value = mockedNewBill.amount;
      screen.getByTestId("vat").value = mockedNewBill.vat;
      screen.getByTestId("pct").value = mockedNewBill.pct;
      screen.getByTestId("commentary").value = mockedNewBill.commentary;
      newBill.fileUrl = mockedNewBill.fileUrl;
      newBill.fileName = mockedNewBill.fileName;
      //appel de fonction et évenment
      newBill.updateBill = jest.fn();
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      // Simulé le click
      userEvent.click(screen.getByTestId('btn-send-bill'));
      //vérifié l'appel de fonction handleSubmit
      expect(handleSubmit).toHaveBeenCalled();
      // vérifie l'appel de la méthode updateBill
      expect(newBill.updateBill).toHaveBeenCalled();
      //vérifié le renvoi vers les note de frai
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
  });
});