import React, { useState } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import api from '../services/api'
import '../styles/style.css'

export default function Home() {
    const [text, setText] = useState('')
    const [products, setProducts] = useState('')

    async function fetchSearchedProducts() {
        try {
            if (text && text.length >= 3) {
                const query = text.toLocaleLowerCase()
                const response = await api.get(`${query}&source=nanook`)
                setProducts(formatProductList(response.data.products))
            } else {
                toast.warn('A busca deve conter mais de 3 caracteres')
            }
        } catch (err) {
            toast.warn('Não foi possível carregar a lista de produtos')
        }
    }

    const formatProductList = (unformatedList) => {
        let teste = unformatedList.map((p) => {
            const formatedProducts = {
                id: p.id,
                name: p.name,
                visitsClickCount: p._meta.visitsClickCount,
            }
            return formatedProducts
        })
        return orderByVisitsClickCount(teste)
    }

    const orderByVisitsClickCount = (unorderedList) => {
        const teste = unorderedList.sort((a, b) => {
            return b.visitsClickCount - a.visitsClickCount
        })
        return teste
    }

    console.log(products)

    return (
        <div className='homeContainer'>
            <Container>
                <Row className='searchRow'>
                    <Col xs={12} sm={10}>
                        <Form.Group>
                            <Form.Control
                                type='text'
                                placeholder='Buscar produtos'
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col className='buttonCol' xs={12} sm={2}>
                        <Button
                            className='searchButton'
                            onClick={() => fetchSearchedProducts()}
                        >
                            Buscar
                        </Button>
                        <ToastContainer />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12} className='customTable'>
                        <BootstrapTable
                            striped
                            hover
                            condensed
                            type='text'
                            placeholder='Digite o nome do produto'
                            keyField='id'
                            data={products}
                            columns={[{ dataField: 'name', text: 'Produto' }]}
                            noDataIndication='Nenhuma informação encontrada'
                        ></BootstrapTable>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
