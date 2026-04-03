import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Partner, Product, Material, InvoiceHistory, KanbanCard, OutsourceEstimate, ProfitSheet, ShippingData, ContractData } from './types';
import { db, auth } from './firebase';
import { collection, doc, onSnapshot, writeBatch, setDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface StoreContextType {
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  buyers: Partner[]; setBuyers: (val: Partner[] | ((prev: Partner[]) => Partner[])) => void;
  suppliers: Partner[]; setSuppliers: (val: Partner[] | ((prev: Partner[]) => Partner[])) => void;
  products: Product[]; setProducts: (val: Product[] | ((prev: Product[]) => Product[])) => void;
  materials: Material[]; setMaterials: (val: Material[] | ((prev: Material[]) => Material[])) => void;
  invoiceHistories: InvoiceHistory[]; setInvoiceHistories: (val: InvoiceHistory[] | ((prev: InvoiceHistory[]) => InvoiceHistory[])) => void;
  kanbanCards: KanbanCard[]; setKanbanCards: (val: KanbanCard[] | ((prev: KanbanCard[]) => KanbanCard[])) => void;
  outsourceEstimates: OutsourceEstimate[]; setOutsourceEstimates: (val: OutsourceEstimate[] | ((prev: OutsourceEstimate[]) => OutsourceEstimate[])) => void;
  profitSheets: ProfitSheet[]; setProfitSheets: (val: ProfitSheet[] | ((prev: ProfitSheet[]) => ProfitSheet[])) => void;
  shippingList: ShippingData[]; setShippingList: (val: ShippingData[] | ((prev: ShippingData[]) => ShippingData[])) => void;
  contractData: ContractData; setContractData: (val: ContractData | ((prev: ContractData) => ContractData)) => void;
  userId: string | null;
  isAuthReady: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

export const StoreProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1350);
  
  const [buyers, setLocalBuyers] = useState<Partner[]>([]);
  const [suppliers, setLocalSuppliers] = useState<Partner[]>([]);
  const [products, setLocalProducts] = useState<Product[]>([]);
  const [materials, setLocalMaterials] = useState<Material[]>([]);
  const [invoiceHistories, setLocalInvoiceHistories] = useState<InvoiceHistory[]>([]);
  const [kanbanCards, setLocalKanbanCards] = useState<KanbanCard[]>([]);
  const [outsourceEstimates, setLocalOutsourceEstimates] = useState<OutsourceEstimate[]>([]);
  const [profitSheets, setLocalProfitSheets] = useState<ProfitSheet[]>([]);
  const [shippingList, setLocalShippingList] = useState<ShippingData[]>([]);
  const [contractData, setLocalContractData] = useState<ContractData>({
    customer: '', productName: '', totalUsd: 0, vatType: 'VAT 포함',
    clause1: '', clause2: '', clause3: '', clause4: '', clause5: '', clause6: '', specialClause: ''
  });

  const isRemoteUpdate = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const unsubscribes: (() => void)[] = [];

    const subscribeToCollection = <T extends { id?: string | number, invoiceNo?: string }>(
      collectionName: string, 
      setLocalState: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      const path = `users/${userId}/${collectionName}`;
      const q = collection(db, path);
      const unsub = onSnapshot(q, (snapshot) => {
        isRemoteUpdate.current[collectionName] = true;
        const data = snapshot.docs.map(doc => doc.data() as T);
        setLocalState(data);
        setTimeout(() => { isRemoteUpdate.current[collectionName] = false; }, 50);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
      unsubscribes.push(unsub);
    };

    subscribeToCollection('buyers', setLocalBuyers);
    subscribeToCollection('suppliers', setLocalSuppliers);
    subscribeToCollection('products', setLocalProducts);
    subscribeToCollection('materials', setLocalMaterials);
    subscribeToCollection('invoiceHistories', setLocalInvoiceHistories);
    subscribeToCollection('kanbanCards', setLocalKanbanCards);
    subscribeToCollection('outsourceEstimates', setLocalOutsourceEstimates);
    subscribeToCollection('profitSheets', setLocalProfitSheets);
    subscribeToCollection('shippingList', setLocalShippingList);

    const contractPath = `users/${userId}/settings/contractData`;
    const contractUnsub = onSnapshot(doc(db, contractPath), (docSnap) => {
      if (docSnap.exists()) {
        isRemoteUpdate.current['contractData'] = true;
        setLocalContractData(docSnap.data() as ContractData);
        setTimeout(() => { isRemoteUpdate.current['contractData'] = false; }, 50);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, contractPath);
    });
    unsubscribes.push(contractUnsub);

    return () => unsubscribes.forEach(unsub => unsub());
  }, [userId]);

  const syncCollection = async <T extends { id?: string | number, invoiceNo?: string }>(
    collectionName: string, 
    currentArray: T[], 
    newArray: T[], 
    getId: (item: T) => string
  ) => {
    if (!userId || isRemoteUpdate.current[collectionName]) return;
    
    const path = `users/${userId}/${collectionName}`;
    try {
      const batch = writeBatch(db);
      const currentMap = new Map(currentArray.map(item => [getId(item), item]));
      const newMap = new Map(newArray.map(item => [getId(item), item]));

      // Deleted
      for (const [id] of currentMap) {
        if (!newMap.has(id)) {
          batch.delete(doc(db, path, id));
        }
      }

      // Added or Updated
      for (const [id, newItem] of newMap) {
        const currentItem = currentMap.get(id);
        if (!currentItem || JSON.stringify(currentItem) !== JSON.stringify(newItem)) {
          batch.set(doc(db, path, id), newItem);
        }
      }

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const createSetter = <T extends { id?: string | number, invoiceNo?: string }>(
    collectionName: string,
    currentArray: T[],
    setLocal: React.Dispatch<React.SetStateAction<T[]>>,
    getId: (item: T) => string
  ) => {
    return (val: T[] | ((prev: T[]) => T[])) => {
      const nextArray = typeof val === 'function' ? (val as any)(currentArray) : val;
      setLocal(nextArray);
      syncCollection(collectionName, currentArray, nextArray, getId);
    };
  };

  const setBuyers = createSetter('buyers', buyers, setLocalBuyers, (item) => String(item.id));
  const setSuppliers = createSetter('suppliers', suppliers, setLocalSuppliers, (item) => String(item.id));
  const setProducts = createSetter('products', products, setLocalProducts, (item) => String(item.id));
  const setMaterials = createSetter('materials', materials, setLocalMaterials, (item) => String(item.id));
  const setInvoiceHistories = createSetter('invoiceHistories', invoiceHistories, setLocalInvoiceHistories, (item) => String(item.invoiceNo));
  const setKanbanCards = createSetter('kanbanCards', kanbanCards, setLocalKanbanCards, (item) => String(item.id));
  const setOutsourceEstimates = createSetter('outsourceEstimates', outsourceEstimates, setLocalOutsourceEstimates, (item) => String(item.id));
  const setProfitSheets = createSetter('profitSheets', profitSheets, setLocalProfitSheets, (item) => String(item.id));
  const setShippingList = createSetter('shippingList', shippingList, setLocalShippingList, (item) => String(item.id));

  const contractWriteTimeout = useRef<NodeJS.Timeout | null>(null);

  const setContractData = async (val: ContractData | ((prev: ContractData) => ContractData)) => {
    const nextData = typeof val === 'function' ? val(contractData) : val;
    setLocalContractData(nextData);
    if (userId && !isRemoteUpdate.current['contractData']) {
      const path = `users/${userId}/settings/contractData`;
      
      if (contractWriteTimeout.current) {
        clearTimeout(contractWriteTimeout.current);
      }
      
      contractWriteTimeout.current = setTimeout(async () => {
        try {
          await setDoc(doc(db, path), nextData);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
      }, 1000);
    }
  };

  return (
    <StoreContext.Provider value={{
      exchangeRate, setExchangeRate,
      buyers, setBuyers,
      suppliers, setSuppliers,
      products, setProducts,
      materials, setMaterials,
      invoiceHistories, setInvoiceHistories,
      kanbanCards, setKanbanCards,
      outsourceEstimates, setOutsourceEstimates,
      profitSheets, setProfitSheets,
      shippingList, setShippingList,
      contractData, setContractData,
      userId, isAuthReady
    }}>
      {children}
    </StoreContext.Provider>
  );
};
