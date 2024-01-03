/**
 * @jest-environment jsdom
 */

import {screen, waitFor,fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES,ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
jest.mock("../app/Store", () => mockStore)
//Étant donné que je suis connecté en tant qu'employé
describe("Given I am connected as an employee", () => {
  //Quand je suis sur la page Bills(factures)
  describe("When I am on Bills Page", () => {
    //Ensuite, l'icône de la facture dans la disposition verticale doit être mise en surbrillance
    test("Then bill icon in vertical layout should be highlighted ", async () => {
      // Simulation des donnée dans le locale storage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      )
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId("icon-window"))
      const windowIcon = screen.getByTestId("icon-window")
      await waitFor(() => screen.getByTestId("icon-mail"))
      const mailIcon = screen.getByTestId("icon-mail")
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()
      expect(mailIcon.classList.contains("active-icon")).not.toBeTruthy()
    });
     // Ensuite les notes doivent être en ordre croissant
    test("Then bills should be ordered from  earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML)
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
  ////////////Test handleClickIconEye containers/Bills.js//////////////////////////
  //Quand je clique sur l'icône de l'oeil bleu
  describe("When I click on the blue eye icon", () => {
    //Ensuite, le modal doit être affiché avec son contenu
    test("Then modal should be displayed with its content", async () => {
       // Simule des données dans le localstorage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
       // Simulation d'un utilisateur de type employé dans le locale storage
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      )
      const html = BillsUI({ data: bills })//création de la constante la modale facture de l'employé
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      }
       // MOCK de la modal
      $.fn.modal = jest.fn()// Affichage de la modale

      // Création d'une facture
      const billsList = new Bills({
        document,
        onNavigate,
        localStorage: localStorageMock,
        localStorage: null,
      })

         //MOCK l'icone de click
    const handleClickIconEye = jest.fn(() => { //fonction qui simule un click
      billsList.handleClickIconEye
    })
    const firstEyeIcon = screen.getAllByTestId("icon-eye")[0]
     // Écoute l'événement click sur icon Oeil
     firstEyeIcon.addEventListener("click", handleClickIconEye)// Click sur le premier icon Oeil
     fireEvent.click(firstEyeIcon);
     // Vérifie si handleClickIconEye a été appeler
     expect(handleClickIconEye).toHaveBeenCalled()
     // Vérifie si la modal a été appeler
     expect($.fn.modal).toHaveBeenCalled()
    })
  })
  //***************** */ Test naviagtion containers/Bills.js
/****************************************************** */

// Lorsque je clique sur le bouton nouvelle note de frais
describe("When i click the button 'Nouvelle note de frais'", () => {
  // Alors je rediriger vers NewwBill
  test("So I redirect to NewwBill", () => {

    //J'intègre le chemin d'accès
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    const billsPage = new Bills({
      document,
      onNavigate,
      store: null,
      bills: bills,
      localStorage: window.localStorage
    })

    // Création constante pour la fonction qui appel la fonction a tester
    const OpenNewBill = jest.fn(billsPage.handleClickNewBill);
    // Boutton "Nouvelle note de frais"
    const btnNewBill = screen.getByTestId("btn-new-bill")

    // Écoute l'event 
    btnNewBill.addEventListener("click", OpenNewBill)//écoute évènement
    // Simule un click sur le boutton "Nouvelle note de frais"
    fireEvent.click(btnNewBill)
    // Verification que OpenNewBill a bien été appeler
    expect(OpenNewBill).toHaveBeenCalled()
    // Vérification que je suis bien sur la page "nouvelle note de frais"
    expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
  })
})


//////////////////Test d'integration getBill/////////////////////////////


// Quand je demande de récupérer des factures
describe("When I get bills", () => {
  // Alors, il devrait afficher les factures
  test("Then it should render bills", async () => {

    // Recupération des factures dans le store
    const bills = new Bills({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    })

    
    const getBills = jest.fn(() => bills.getBills());

    const value = await getBills()

    // getBills doit être appeler
    expect(getBills).toHaveBeenCalled()
    // Test si la longeur du tableau (le tableau doit contenir les 4 factures du __mocks__ store)
    expect(value.length).toBe(4)//test si la longeur du tableau est a 4 du store.js
  })
})
