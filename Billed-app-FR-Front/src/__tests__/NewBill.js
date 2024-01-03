/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import { screen,fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store.js"
import { ROUTES } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js"
// Mock de la fonction window.alert
 window.alert = jest.fn()
 // Mock du module "../app/Store"
jest.mock("../app/Store", () => mockStore)
// Étant donné que je suis connecté en tant qu'employé
describe("Given I am connected as an employee", () => {

  Object.defineProperty(window, 'localStorage', { value: localStorageMock })

  window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
  // Quand je suis sur la page NewBill
  describe("When I am on NewBill Page", () => {
    // Alors la nouvelle note de frais reste sur l'écran
    test("Then, the NewBill remains displayed on the screen", () => {
        // Nouvelle note de frais
      const html = NewBillUI()
      document.body.innerHTML = html
      // Date
      const date = screen.getByTestId("datepicker")
      expect(date.value).toBe("")
       // Montant
       const montantTTC = screen.getByTestId("amount")
       expect(montantTTC.value).toBe("")
       // fichier
       const fichier = screen.getByTestId("file")
       expect (fichier.value).toBe("")
       // récupère formulaire 
       const formNewBill = screen.getByTestId("form-new-bill")
       //le formulaire est présent
       expect(formNewBill).toBeTruthy()
       // test bouton d'envoi formulaire
       //stop la fonction par default
       const sendNewBll = jest.fn((e)=>e.preventDefault())
       //ecouter le bouton d'envoi formulaire
       formNewBill.addEventListener('submit', sendNewBll)
       //on simule le clique sur le bouton
       fireEvent.submit(formNewBill)
       // formulaire toujour present apres le clic 
       expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })
  })
    // J'ajoute un ficher joint au bon format
    describe("When i download the attached file in the correct format ", () => {
      // La nouvelle note de frais et envoyé
      test ("Then the newbill is sent", () => {
        
        // Simulation de la page note de frais
        const html = NewBillUI()         
        document.body.innerHTML = html
  
        const onNavigate = (pathname) => {  
          document.body.innerHTML = ROUTES({ pathname })
        }
  
        // Création d'une nouvelle instance newBill
        //je crée une nouvelle instance newbill
        const newBill = new NewBill({ 
          document,
          onNavigate,
          store: mockStore,
          localStorage: window, localStorage,
        })
  
        // Création constante pour fonction qui appel la fonction a tester
        const LoadFile = jest.fn((e) => newBill.handleChangeFile(e))//chargement du fichier
        
        // Recupération du champ du fichier
        const fichier = screen.getByTestId("file")
  
        // Condition du test
        const testFormat = new File(["c'est un test"],  "test.jpg", { type: "image/jpg" })
  
  
        // Écoute l'event
        fichier.addEventListener("change", LoadFile)
  
        // Évènement au change en relation avec la condition du test
        fireEvent.change(fichier, {target: {files: [testFormat]}})
        
        // Je vérifie que le fichier est bien chargé
        expect(LoadFile).toHaveBeenCalled()
  
        // Je vérifie que le fichier téléchargé est bien conforme à la condition du test
        expect(fichier.files[0]).toStrictEqual(testFormat)
    
        // Cible le formulaire
        const formNewBill = screen.getByTestId('form-new-bill')
        expect(formNewBill).toBeTruthy()
    
        // Simule la fonction
        const sendNewBill = jest.fn((e) => newBill.handleSubmit(e))
  
        //ecouter le bouton d'envoi formulaire
        formNewBill.addEventListener('submit', sendNewBill)
  
       //on simule le clique sur le bouton
        fireEvent.submit(formNewBill)
        expect(sendNewBill).toHaveBeenCalled()
  
        // Lorsqu'on créer une nouvelle note de frais on verifie s'il est bien redirigé vers la page d'accueil
        expect(screen.getByText('Mes notes de frais')).toBeTruthy()
      })
  
  
    })


})
