import {Product} from '../product/product';
import {Store} from '../store/store';

export interface Item{
    product: Product;
    store: Store;
}