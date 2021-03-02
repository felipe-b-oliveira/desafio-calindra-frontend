import React, { useState } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import { toast } from 'react-toastify'
import api from '../services/api'
import '../styles/style.css'

const productsMockColumn = [
    {
        dataField: 'id',
        text: '#',
        headerStyle: (colum, colIndex) => {
            return { width: '10vw' }
        },
    },
    {
        dataField: 'nome',
        text: 'Produto',
    },
]

export default function Home() {
    const [text, setText] = useState('')
    const [products, setProducts] = useState('')

    async function fetchSearchedProducts() {
        try {
            const response = await api.get(`${text}&source=nanook`)
            setProducts(
                response.data.products.map((p) => {
                    const formatedProducts = {
                        id: p.id,
                        nome: p.name,
                    }
                    return formatedProducts
                })
            )
        } catch (err) {
            toast.warn('Não foi possível carregar a lista de produtos')
        }
    }

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
                            columns={productsMockColumn}
                            noDataIndication='Nenhuma informação encontrada'
                        ></BootstrapTable>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
