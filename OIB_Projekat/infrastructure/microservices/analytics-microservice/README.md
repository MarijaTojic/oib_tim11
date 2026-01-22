# Analytics Microservice - O'Seignel De Or Perfumery

Mikroservis za analizu podataka koji omogućava upravljanje fiskalnim računima, kreiranje analiza prodaje, i generisanje PDF izveštaja.

## Pregled

Analytics Microservice je deo mikrosevrisne arhitekture OIB sistema i odgovoran je za:
- Kreiranje i upravljanje fiskalnim računima
- Analizu prodaje po različitim kriterijumima (mesečno, sedmično, godišnje, ukupno)
- Praćenje top 10 najprodavanijih parfema
- Analizu trendova prodaje
- Generisanje detaljnih PDF izveštaja

## Instalacija

### Preduslov
- Node.js verzija 16+
- MySQL baza podataka
- TypeScript

### Koraci instalacije

1. Instalacija zavisnosti:
```bash
npm install
```

2. Konfiguracija `.env` fajla:
Kreiraj `.env` fajl u korenu projekta sa sledećim podacima:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=izvestaji_analize

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:9080,http://localhost:8080
CORS_METHODS=GET,POST,PUT,DELETE,PATCH

# Server Configuration
PORT=3007
NODE_ENV=development
```

3. Pokretanje mikroservisa:

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm run start:dist
```

## Baza Podataka

Mikroservis koristi dve tabele u `izvestaji_analize` bazi:

### Tabela: `fiskalni_racuni`
```sql
CREATE TABLE IF NOT EXISTS `fiskalni_racuni` (
  `id` int NOT NULL AUTO_INCREMENT,
  `saleType` enum('retail','wholesale') NOT NULL,
  `paymentType` enum('cash','bank_transfer','card') NOT NULL,
  `perfumeDetails` json NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `userId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

### Tabela: `izvestaji_analize`
```sql
CREATE TABLE IF NOT EXISTS `izvestaji_analize` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reportName` varchar(255) NOT NULL,
  `analysisType` enum('monthly','weekly','yearly','total') NOT NULL DEFAULT 'total',
  `salesData` json NOT NULL,
  `topTenPerfumes` json NOT NULL,
  `salesTrend` json NOT NULL,
  `pdfData` longtext NOT NULL,
  `generatedBy` varchar(255),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `exportedAt` timestamp,
  PRIMARY KEY (`id`)
);
```

## API Endpoints

### Receipt Management (Fiskalni Računi)

#### 1. Kreiranje Novog Računa
**POST** `/api/v1/receipts`

**Request Body:**
```json
{
  "saleType": "retail",
  "paymentType": "card",
  "perfumeDetails": [
    {
      "perfumeId": 1,
      "perfumeName": "Eau de Parfum - Rose",
      "quantity": 2,
      "price": 89.99,
      "totalPrice": 179.98
    }
  ],
  "totalAmount": 179.98,
  "userId": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "saleType": "retail",
    "paymentType": "card",
    "perfumeDetails": [...],
    "totalAmount": 179.98,
    "userId": 1,
    "createdAt": "2026-01-22T10:30:00.000Z"
  }
}
```

**Validacijske Greške (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Sale type is required",
    "Perfume details must be an array"
  ]
}
```

#### 2. Pregled Računa Korisnika
**GET** `/api/v1/receipts/:userId?startDate=2026-01-01&endDate=2026-01-31`

**Parameters:**
- `userId` (path, obavezno): ID korisnika
- `startDate` (query, opciono): Početni datum (ISO format)
- `endDate` (query, opciono): Krajnji datum (ISO format)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "saleType": "retail",
      "paymentType": "card",
      "perfumeDetails": [...],
      "totalAmount": 179.98,
      "userId": 1,
      "createdAt": "2026-01-22T10:30:00.000Z"
    }
  ]
}
```

#### 3. Pregled Određenog Računa
**GET** `/api/v1/receipts/detail/:id`

**Parameters:**
- `id` (path, obavezno): ID računa

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "saleType": "retail",
    "paymentType": "card",
    "perfumeDetails": [...],
    "totalAmount": 179.98,
    "userId": 1,
    "createdAt": "2026-01-22T10:30:00.000Z"
  }
}
```

#### 4. Brisanje Računa
**DELETE** `/api/v1/receipts/:id`

**Parameters:**
- `id` (path, obavezno): ID računa

**Response (200):**
```json
{
  "success": true,
  "message": "Receipt deleted"
}
```

### Report Analysis (Analiza Izveštaja)

#### 1. Kreiranje Novog Izveštaja
**POST** `/api/v1/reports`

**Request Body:**
```json
{
  "reportName": "Monthly Sales Analysis - January 2026",
  "analysisType": "monthly",
  "salesData": {
    "totalSales": 5,
    "totalRevenue": 1644.86,
    "period": "2026-01"
  },
  "topTenPerfumes": [
    {
      "perfumeId": 1,
      "perfumeName": "Eau de Parfum - Rose",
      "quantity": 3,
      "revenue": 269.97
    }
  ],
  "salesTrend": [
    {
      "date": "2026-01-15",
      "sales": 2,
      "revenue": 459.94
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "reportName": "Monthly Sales Analysis - January 2026",
    "analysisType": "monthly",
    "salesData": {...},
    "topTenPerfumes": [...],
    "salesTrend": [...],
    "createdAt": "2026-01-22T10:30:00.000Z"
  }
}
```

#### 2. Pregled Svih Izveštaja
**GET** `/api/v1/reports?limit=10`

**Parameters:**
- `limit` (query, opciono): Maksimalni broj izveštaja

**Response (200):**
```json
{
  "success": true,
  "data": [...]
}
```

#### 3. Pregled Određenog Izveštaja
**GET** `/api/v1/reports/:id`

**Parameters:**
- `id` (path, obavezno): ID izveštaja

**Response (200):**
```json
{
  "success": true,
  "data": {...}
}
```

#### 4. Brisanje Izveštaja
**DELETE** `/api/v1/reports/:id`

**Parameters:**
- `id` (path, obavezno): ID izveštaja

**Response (200):**
```json
{
  "success": true,
  "message": "Report deleted"
}
```

#### 5. Ažuriranje Datuma Izvoza
**PATCH** `/api/v1/reports/:id/export`

**Parameters:**
- `id` (path, obavezno): ID izveštaja

**Response (200):**
```json
{
  "success": true,
  "message": "Report export date updated"
}
```

### Sales Analysis (Analiza Prodaje)

#### 1. Izračunavanje Analize Prodaje
**POST** `/api/v1/analysis/sales`

**Request Body:**
```json
{
  "analysisType": "monthly",
  "period": "2026-01"
}
```

**Validne vrijednosti za `analysisType`:**
- `monthly` - zahteva `period` u formatu YYYY-MM
- `weekly` - zahteva `period` u formatu ISO date string
- `yearly` - zahteva `period` u formatu YYYY
- `total` - bez potrebe za `period`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSales": 5,
    "totalRevenue": 1644.86,
    "period": "2026-01"
  }
}
```

#### 2. Pregled Top 10 Parfema
**GET** `/api/v1/analysis/top-ten`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "perfumeId": 1,
      "perfumeName": "Eau de Parfum - Rose",
      "quantity": 3,
      "revenue": 269.97
    },
    ...
  ]
}
```

#### 3. Pregled Trendova Prodaje
**GET** `/api/v1/analysis/trend?days=30`

**Parameters:**
- `days` (query, opciono): Broj dana za analizu (default: 30)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-01-15",
      "sales": 2,
      "revenue": 459.94
    },
    ...
  ]
}
```

### PDF Export

#### 1. Generisanje PDF Izveštaja
**GET** `/api/v1/reports/:id/pdf`

**Parameters:**
- `id` (path, obavezno): ID izveštaja

**Response (200):** PDF dokument sa sledećim sadržajem:
- Zaglavlje sa informacijama o izveštaju
- Detalji prodaje (ukupne transakcije i prihod)
- Top 10 parfema sa detaljima
- Trend prodaje za poslednjeg 30 dana
- Fusnota sa informacijama o generisanju

**Primer URL-a:**
```
http://localhost:3007/api/v1/reports/1/pdf
```

## Enumeracije

### SaleType
```typescript
enum SaleType {
  RETAIL = 'retail',        // Maloprodaja
  WHOLESALE = 'wholesale'   // Veleprodaja
}
```

### PaymentType
```typescript
enum PaymentType {
  CASH = 'cash',                    // Gotovina
  BANK_TRANSFER = 'bank_transfer', // Bankski transfer
  CARD = 'card'                     // Kartično plačanje
}
```

### AnalysisType
```typescript
enum AnalysisType {
  MONTHLY = 'monthly',   // Mesečna analiza
  WEEKLY = 'weekly',     // Sedmična analiza
  YEARLY = 'yearly',     // Godišnja analiza
  TOTAL = 'total'        // Ukupna analiza
}
```

## Validacije

### Receipt Validacije
- `saleType`: Obavezno, mora biti 'retail' ili 'wholesale'
- `paymentType`: Obavezno, mora biti 'cash', 'bank_transfer' ili 'card'
- `perfumeDetails`: Obavezno, mora biti niz sa najmanje jednim elementom
  - `perfumeId`: Obavezno, mora biti broj
  - `perfumeName`: Obavezno, mora biti string
  - `quantity`: Obavezno, mora biti pozitivan broj
  - `price`: Obavezno, mora biti nenegativan broj
  - `totalPrice`: Obavezno, mora biti nenegativan broj
- `totalAmount`: Obavezno, mora biti pozitivan broj
- `userId`: Obavezno, mora biti broj

### ReportAnalysis Validacije
- `reportName`: Obavezno, mora biti string
- `analysisType`: Obavezno, mora biti 'monthly', 'weekly', 'yearly' ili 'total'
- `salesData`: Obavezno, mora biti objekat sa:
  - `totalSales`: Obavezno, nenegativan broj
  - `totalRevenue`: Obavezno, nenegativan broj
  - `period`: Opciono, string
- `topTenPerfumes`: Opciono, ali ako postoji mora biti niz validnih perfume objekata
- `salesTrend`: Opciono, ali ako postoji mora biti niz validnih trend objekata

## Seed Podaci

Pri pokretanju aplikacije, automatski se kreiraju test podaci:

### Kreirani Računi (5 primjera):
- 2 retail računa sa različitim parfemima
- 3 wholesale računa sa većim količinama
- Ukupan prihod: €1,644.86

### Kreirani Izveštaji (3 primjera):
- Mesečna analiza - januar 2026
- Sedmična analiza - nedelja 3 januara 2026
- Ukupna analiza - sve vreme

## Error Handling

Mikroservis vraća sledeće HTTP status kodove:

- `200 OK`: Uspešna operacija
- `201 Created`: Resurs je uspešno kreiran
- `400 Bad Request`: Validacijska greška ili nedostaju obavezni parametri
- `404 Not Found`: Resurs nije pronađen
- `500 Internal Server Error`: Greška na serveru

## Logging

Sve akcije se logiraju sa sledećim nivoima:
- **INFO**: Sve uspešne operacije
- **WARNING**: Greške pri validaciji
- **ERROR**: Greške pri izvršavanju

Logovi se šalju na Log Microservice putem HTTP zahteva.

## CORS Konfiguracija

Mikroservis je podešen da prihvata zahteve samo od dozvoljenih origin-a definisanih u `.env`:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:9080,http://localhost:8080
```

## Pokretanje Testova

```bash
npm run typecheck
```

## Struktura Projekta

```
src/
├── app.ts                          # Express aplikacija
├── index.ts                        # Entry point
├── Domain/
│   ├── models/
│   │   ├── Receipt.ts             # Model fiskalnog računa
│   │   └── ReportAnalysis.ts      # Model analitičkog izveštaja
│   ├── services/
│   │   ├── IAnalyticsService.ts   # Interfejs analitike
│   │   ├── IValidatorService.ts   # Interfejs validatora
│   │   └── ILogerService.ts       # Interfejs logger-a
│   ├── enums/
│   │   ├── SaleType.ts            # Tip prodaje enum
│   │   └── PaymentType.ts         # Tip plaćanja enum
│   └── index.ts                    # Domain export
├── Services/
│   ├── AnalyticsService.ts        # Implementacija analitike
│   ├── ValidatorService.ts        # Implementacija validatora
│   ├── LogerService.ts            # Implementacija logger-a
│   └── index.ts                    # Services export
├── Database/
│   ├── DbConnectionPool.ts        # TypeORM konfiguracija
│   ├── InitializeConnection.ts    # DB inicijalizacija i seeder
│   ├── DatabaseSeeder.ts          # Seed podaci
│   └── index.ts                    # Database export
└── WebAPI/
    ├── controllers/
    │   ├── AnalyticsController.ts # Kontroler svih ruta
    │   └── index.ts                # WebAPI export
    └── index.ts
```

## Zavisnosti

- **express**: Web framework
- **typeorm**: ORM za bazu podataka
- **mysql2**: MySQL driver
- **cors**: CORS middleware
- **dotenv**: Enviroment konfiguracija
- **pdfkit**: PDF generisanje
- **reflect-metadata**: Metadata refleksija

## Development Zavisnosti

- **typescript**: TypeScript kompajler
- **ts-node**: TypeScript executor
- **nodemon**: File watcher za automatski restart
- **@types/\***: TypeScript type definicije
- **eslint**: Code linting

## Najbolje Prakse

1. **Validacija**: Svi ulazni podaci se validirate pre obrade
2. **Error Handling**: Sve greške se logiraju i vraćaju korisnikul sa odgovarajućim status kodom
3. **CORS**: Mikroservis je zaštičen CORS konfiguracijlom
4. **Logging**: Sve akcije se logiraju za auditiranje
5. **Seeding**: Test podaci se automatski kreiraju pri startanju

## Kontakt i Podrška

Za probleme ili pitanja vezana uz Analytics Microservice, kontaktirajte development tim projekta O'Seignel De Or Perfumery.

---

**Verzija:** 1.0.0  
**Zadnja Ažuriranja:** Januar 2026  
**Status:** Aktivan
